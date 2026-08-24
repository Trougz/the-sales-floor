from django.db import migrations, models


def rename_submitted_to_screening(apps, schema_editor):
    Match = apps.get_model('candidates', 'Match')
    Match.objects.filter(stage='submitted').update(stage='screening')


def rename_screening_to_submitted(apps, schema_editor):
    Match = apps.get_model('candidates', 'Match')
    Match.objects.filter(stage='screening').update(stage='submitted')


class Migration(migrations.Migration):

    dependencies = [
        ('candidates', '0016_recruiters_group_screened_views'),
    ]

    operations = [
        migrations.RunPython(rename_submitted_to_screening, rename_screening_to_submitted),
        migrations.AlterField(
            model_name='match',
            name='stage',
            field=models.CharField(
                choices=[
                    ('screening', 'Screening'),
                    ('interviewing', 'Interviewing'),
                    ('offer', 'Offer'),
                    ('placed', 'Placed'),
                    ('rejected', 'Rejected'),
                ],
                default='screening',
                max_length=20,
            ),
        ),
    ]
