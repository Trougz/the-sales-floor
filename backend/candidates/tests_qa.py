import tempfile
from unittest.mock import patch

from django.contrib.auth.models import Group, User
from django.test import TestCase, override_settings
from django.utils import timezone

from .models import Candidate

MEDIA_TMP = tempfile.mkdtemp()


def _make_candidate(**overrides):
    defaults = dict(
        name='Test Candidate',
        email='candidate@example.com',
        phone='555-0100',
        current_company_name='Acme',
        years_experience=5,
        desired_ote='$140k-$250k',
        open_to_relocation=True,
    )
    defaults.update(overrides)
    return Candidate.objects.create(**defaults)


@override_settings(
    MEDIA_ROOT=MEDIA_TMP,
    AUTOMATION_API_KEY='test-secret',
    N8N_INVITE_WEBHOOK_URL='http://n8n.example.com/webhook/invite',
    CALENDLY_SCHEDULING_URL='https://calendly.com/test/screening',
)
class QaReviewAccessTests(TestCase):
    def setUp(self):
        self.candidate = _make_candidate(pass_fail='pass', ranking_score=80)
        self.reviewer = User.objects.create_user('reviewer', password='pw', is_staff=True)
        self.reviewer.groups.add(Group.objects.get(name='QA Reviewers'))

    def test_anonymous_is_redirected_to_login(self):
        response = self.client.get('/qa/candidates/')
        self.assertEqual(response.status_code, 302)

    def test_staff_outside_group_gets_403(self):
        outsider = User.objects.create_user('outsider', password='pw', is_staff=True)
        self.client.force_login(outsider)
        response = self.client.get('/qa/candidates/')
        self.assertEqual(response.status_code, 403)

    def test_reviewer_sees_pending_candidate(self):
        self.client.force_login(self.reviewer)
        response = self.client.get('/qa/candidates/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.candidate.name)

    def test_queue_excludes_already_invited(self):
        self.candidate.booking_invite_sent_at = timezone.now()
        self.candidate.save(update_fields=['booking_invite_sent_at'])

        self.client.force_login(self.reviewer)
        response = self.client.get('/qa/candidates/')
        self.assertNotContains(response, self.candidate.name)

    def test_detail_404s_for_failed_candidate(self):
        failed = _make_candidate(email='fail@example.com', pass_fail='fail')
        self.client.force_login(self.reviewer)
        response = self.client.get(f'/qa/candidates/{failed.id}/')
        self.assertEqual(response.status_code, 404)


@override_settings(
    MEDIA_ROOT=MEDIA_TMP,
    AUTOMATION_API_KEY='test-secret',
    N8N_INVITE_WEBHOOK_URL='http://n8n.example.com/webhook/invite',
    CALENDLY_SCHEDULING_URL='https://calendly.com/test/screening',
)
class SendInviteTests(TestCase):
    def setUp(self):
        self.candidate = _make_candidate(pass_fail='pass', ranking_score=80)
        self.reviewer = User.objects.create_user('reviewer', password='pw', is_staff=True)
        self.reviewer.groups.add(Group.objects.get(name='QA Reviewers'))
        self.client.force_login(self.reviewer)

    @patch('candidates.qa_views.urllib.request.urlopen')
    def test_success_does_not_set_booking_invite_sent_at(self, mock_urlopen):
        mock_urlopen.return_value.__enter__.return_value.read.return_value = b'{}'

        response = self.client.post(f'/qa/candidates/{self.candidate.id}/send-invite/')

        self.assertEqual(response.status_code, 302)
        self.candidate.refresh_from_db()
        self.assertIsNone(self.candidate.booking_invite_sent_at)
        self.assertTrue(mock_urlopen.called)

    @patch('candidates.qa_views.urllib.request.urlopen', side_effect=TimeoutError('timed out'))
    def test_webhook_timeout_surfaces_error_without_hanging(self, mock_urlopen):
        response = self.client.post(f'/qa/candidates/{self.candidate.id}/send-invite/')

        self.assertEqual(response.status_code, 302)
        self.candidate.refresh_from_db()
        self.assertIsNone(self.candidate.booking_invite_sent_at)

    def test_cannot_invite_a_failed_candidate(self):
        failed = _make_candidate(email='fail@example.com', pass_fail='fail')
        response = self.client.post(f'/qa/candidates/{failed.id}/send-invite/')
        self.assertEqual(response.status_code, 404)
