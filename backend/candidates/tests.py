import tempfile

from django.contrib.auth.models import Group, User
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


@override_settings(MEDIA_ROOT=MEDIA_TMP)
class RecruitersGroupTests(TestCase):
    """The Recruiters group is created by migration 0005.

    These run against a freshly migrated test database, which is the case
    that actually breaks: auth permissions are created by a post_migrate
    signal that hasn't fired while migrations are still running.
    """

    def setUp(self):
        self.group = Group.objects.get(name='Recruiters')

    def test_group_has_expected_permissions(self):
        actual = set(self.group.permissions.values_list('codename', flat=True))

        self.assertEqual(actual, {
            'add_candidate', 'change_candidate', 'view_candidate',
            'add_company', 'change_company', 'view_company',
            'add_requisition', 'change_requisition', 'view_requisition',
            'add_match', 'change_match', 'delete_match', 'view_match',
            'add_industry', 'change_industry', 'view_industry',
            'add_crmtool', 'change_crmtool', 'view_crmtool',
            'add_workstyle', 'change_workstyle', 'view_workstyle',
        })

    def test_group_cannot_delete_candidates_or_lookups(self):
        # The point of not handing out superuser: a misclick must not be able
        # to destroy a real application, resume included.
        codenames = set(self.group.permissions.values_list('codename', flat=True))

        for codename in ('delete_candidate', 'delete_company',
                         'delete_requisition', 'delete_industry'):
            self.assertNotIn(codename, codenames)

    def test_group_grants_nothing_outside_the_candidates_app(self):
        apps_touched = set(
            self.group.permissions.values_list('content_type__app_label', flat=True)
        )

        self.assertEqual(apps_touched, {'candidates'})

    def test_member_can_reach_the_admin_and_see_candidates(self):
        self._log_in_group_member()

        self.assertEqual(self.client.get('/admin/').status_code, 200)
        self.assertEqual(
            self.client.get('/admin/candidates/candidate/').status_code, 200
        )

    def test_member_is_refused_the_user_admin(self):
        self._log_in_group_member()

        self.assertEqual(self.client.get('/admin/auth/user/').status_code, 403)

    def test_member_can_open_a_resume(self):
        # Group membership has to be enough on its own -- serve_media is
        # staff_member_required, which is a weaker check than a permission.
        self._log_in_group_member()
        candidate = Candidate.objects.create(
            name='Test Candidate',
            email='test@example.com',
            phone='555-0100',
            current_company_name='Acme',
            years_experience=5,
            desired_ote=150000,
            open_to_relocation=True,
            resume=SimpleUploadedFile('resume.pdf', b'%PDF-1.4 fake'),
        )

        response = self.client.get(candidate.resume.url)

        self.assertEqual(response.status_code, 200)

    def _log_in_group_member(self):
        nate = User.objects.create_user(
            'nate', 'nate@example.com', 'pw', is_staff=True
        )
        nate.groups.add(self.group)
        self.client.login(username='nate', password='pw')
