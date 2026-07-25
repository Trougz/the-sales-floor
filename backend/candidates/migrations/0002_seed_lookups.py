from django.db import migrations

INDUSTRIES = ['SaaS', 'Fintech', 'Martech', 'Healthtech', 'Cybersecurity', 'HR Tech', 'Open to All']
CRM_TOOLS = ['Salesforce', 'HubSpot', 'Apollo', 'Outreach', 'Gong', 'ZoomInfo']
WORK_STYLES = ['Remote', 'Hybrid', 'In-office']


def seed(apps, schema_editor):
    Industry = apps.get_model('candidates', 'Industry')
    CrmTool = apps.get_model('candidates', 'CrmTool')
    WorkStyle = apps.get_model('candidates', 'WorkStyle')

    for name in INDUSTRIES:
        Industry.objects.get_or_create(name=name)
    for name in CRM_TOOLS:
        CrmTool.objects.get_or_create(name=name)
    for name in WORK_STYLES:
        WorkStyle.objects.get_or_create(name=name)


def unseed(apps, schema_editor):
    apps.get_model('candidates', 'Industry').objects.filter(name__in=INDUSTRIES).delete()
    apps.get_model('candidates', 'CrmTool').objects.filter(name__in=CRM_TOOLS).delete()
    apps.get_model('candidates', 'WorkStyle').objects.filter(name__in=WORK_STYLES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('candidates', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
