import tempfile

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from .models import Candidate

MEDIA_TMP = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=MEDIA_TMP)
class ResumeDownloadTests(TestCase):
    """Resumes live under MEDIA_ROOT, which nothing serves in production.
    These cover the staff-only view that replaced the DEBUG-only static route.
    """

    def setUp(self):
        self.candidate = Candidate.objects.create(
            name='Test Candidate',
            email='test@example.com',
            phone='555-0100',
            current_company_name='Acme',
            years_experience=5,
            desired_ote=150000,
            open_to_relocation=True,
            resume=SimpleUploadedFile('resume.pdf', b'%PDF-1.4 fake', content_type='application/pdf'),
        )
        # Exercise the URL the admin actually links to, rather than a
        # hand-built one -- linking to a path nothing served was the bug.
        self.url = self.candidate.resume.url

    def test_resume_url_is_under_media_url(self):
        self.assertTrue(self.url.startswith('/media/'))

    def test_staff_can_open_resume(self):
        User.objects.create_superuser('recruiter', 'r@example.com', 'pw')
        self.client.login(username='recruiter', password='pw')

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(b''.join(response.streaming_content), b'%PDF-1.4 fake')

    def test_traversal_outside_media_root_is_rejected(self):
        User.objects.create_superuser('recruiter', 'r@example.com', 'pw')
        self.client.login(username='recruiter', password='pw')

        response = self.client.get('/media/../../salesfloor/settings.py')

        self.assertNotEqual(response.status_code, 200)

    def test_anonymous_is_redirected_to_login(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 302)
        self.assertIn('/admin/login/', response['Location'])

    def test_non_staff_user_cannot_open_resume(self):
        User.objects.create_user('outsider', 'o@example.com', 'pw')
        self.client.login(username='outsider', password='pw')

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 302)

    def test_missing_file_404s_instead_of_500(self):
        # e.g. uploaded before the persistent disk was mounted: row survived,
        # file didn't.
        self.candidate.resume.storage.delete(self.candidate.resume.name)
        User.objects.create_superuser('recruiter', 'r@example.com', 'pw')
        self.client.login(username='recruiter', password='pw')

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 404)
