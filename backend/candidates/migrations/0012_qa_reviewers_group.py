from django.apps import apps as global_apps
from django.contrib.auth.management import create_permissions
from django.db import migrations

GROUP_NAME = 'QA Reviewers'

# Review-and-trigger only, not edit: this group looks at already-ranked
# candidates on the QA review pages (candidates/qa_views.py) and clicks
# "send invite" -- it must never be able to add, change, or delete a
# Candidate (or anything else), unlike Recruiters.
PERMISSIONS = {
    'candidate': ['view'],
}


def create_qa_reviewers_group(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    # Permissions are normally created by a post_migrate signal, which fires
    # only after every migration has run -- so on a fresh database they don't
    # exist yet at this point and the lookup below would find nothing. Create
    # them now; the later signal is a get_or_create and will leave these be.
    create_permissions(global_apps.get_app_config('candidates'), verbosity=0)

    group, _ = Group.objects.get_or_create(name=GROUP_NAME)

    codenames = [
        f'{action}_{model}'
        for model, actions in PERMISSIONS.items()
        for action in actions
    ]
    content_types = ContentType.objects.filter(
        app_label='candidates', model__in=PERMISSIONS
    )
    perms = Permission.objects.filter(
        content_type__in=content_types, codename__in=codenames
    )

    expected = len(codenames)
    if perms.count() != expected:
        found = set(perms.values_list('codename', flat=True))
        missing = sorted(set(codenames) - found)
        raise RuntimeError(
            f'Expected {expected} candidates permissions for the {GROUP_NAME} '
            f'group, found {perms.count()}. Missing: {missing}'
        )

    group.permissions.set(perms)


def delete_qa_reviewers_group(apps, schema_editor):
    apps.get_model('auth', 'Group').objects.filter(name=GROUP_NAME).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('candidates', '0011_remove_promotion_fields'),
        ('auth', '0012_alter_user_first_name_max_length'),
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.RunPython(create_qa_reviewers_group, delete_qa_reviewers_group),
    ]
