from django.db import migrations

GROUP_NAME = 'Recruiters'

# The AE's/Sales Managers/SDR-BDRs/Rejected admin views (candidates.admin)
# are proxy models over Candidate, so Django gives them their own separate
# permissions (change_candidateae, etc.) distinct from change_candidate --
# the Recruiters group (0005_recruiters_group.py) needs an explicit grant
# here or these new views 404 for anyone who isn't a superuser. change+view
# only: add is blocked at the UI level (CandidateAEAdmin.has_add_permission
# etc. in candidates/admin.py) since creating from a filtered view would
# leave screening_title unset, and delete stays off-limits everywhere, same
# as the underlying Candidate permissions.
PERMISSIONS = {
    'candidateae': ['change', 'view'],
    'candidatesalesmanager': ['change', 'view'],
    'candidatesdrbdr': ['change', 'view'],
    'candidaterejected': ['change', 'view'],
}


def _codenames():
    return [
        f'{action}_{model}'
        for model, actions in PERMISSIONS.items()
        for action in actions
    ]


def _lookup_perms(apps):
    ContentType = apps.get_model('contenttypes', 'ContentType')
    Permission = apps.get_model('auth', 'Permission')

    codenames = _codenames()
    content_types = ContentType.objects.filter(app_label='candidates', model__in=PERMISSIONS)
    perms = Permission.objects.filter(content_type__in=content_types, codename__in=codenames)

    expected = len(codenames)
    if perms.count() != expected:
        found = set(perms.values_list('codename', flat=True))
        missing = sorted(set(codenames) - found)
        raise RuntimeError(
            f'Expected {expected} candidates proxy-model permissions, found '
            f'{perms.count()}. Missing: {missing}'
        )
    return perms


def grant_screened_view_permissions(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')

    # Same reasoning as 0005/0012: permissions are normally created by a
    # post_migrate signal that only fires after every migration in this run
    # has applied, so on a fresh database the proxy models' permissions
    # don't exist yet at this point without creating them explicitly.
    from django.apps import apps as global_apps
    from django.contrib.auth.management import create_permissions
    create_permissions(global_apps.get_app_config('candidates'), verbosity=0)

    group, _ = Group.objects.get_or_create(name=GROUP_NAME)
    # .add(), not .set() (unlike 0005/0012) -- this group already has
    # Candidate/Company/Requisition/etc. permissions and this migration only
    # extends that set, it doesn't recreate the group from scratch.
    group.permissions.add(*_lookup_perms(apps))


def revoke_screened_view_permissions(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    try:
        group = Group.objects.get(name=GROUP_NAME)
    except Group.DoesNotExist:
        return
    group.permissions.remove(*_lookup_perms(apps))


class Migration(migrations.Migration):

    dependencies = [
        ('candidates', '0015_candidateae_candidaterejected_candidatesalesmanager_and_more'),
        ('candidates', '0005_recruiters_group'),
    ]

    operations = [
        migrations.RunPython(grant_screened_view_permissions, revoke_screened_view_permissions),
    ]
