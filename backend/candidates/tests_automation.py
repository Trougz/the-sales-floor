import json
import tempfile
from unittest.mock import patch

from django.test import TestCase, override_settings
from django.utils import timezone

from .ai.ranking import MAX_CANDIDATES_PER_BATCH
from .models import Candidate

MEDIA_TMP = tempfile.mkdtemp()


def _make_candidate(**overrides):
    defaults = dict(
        name='Test Candidate',
        email='test@example.com',
        phone='555-0100',
        current_company_name='Acme',
        years_experience=5,
        desired_ote='$140k-$250k',
        open_to_relocation=True,
    )
    defaults.update(overrides)
    return Candidate.objects.create(**defaults)


@override_settings(MEDIA_ROOT=MEDIA_TMP, AUTOMATION_API_KEY='test-secret')
class AutomationAuthTests(TestCase):
    def test_missing_header_is_rejected(self):
        response = self.client.get('/api/automation/daily-report/')
        self.assertEqual(response.status_code, 401)

    def test_wrong_key_is_rejected(self):
        response = self.client.get(
            '/api/automation/daily-report/', HTTP_X_AUTOMATION_KEY='wrong'
        )
        self.assertEqual(response.status_code, 401)

    def test_correct_key_is_accepted(self):
        response = self.client.get(
            '/api/automation/daily-report/', HTTP_X_AUTOMATION_KEY='test-secret'
        )
        self.assertEqual(response.status_code, 200)


@override_settings(MEDIA_ROOT=MEDIA_TMP, AUTOMATION_API_KEY='')
class AutomationUnconfiguredKeyTests(TestCase):
    def test_blank_configured_key_rejects_everything(self):
        # Even a request that happens to send an empty header must not pass,
        # since that would mean "unset" and "matches" are the same thing.
        response = self.client.get(
            '/api/automation/daily-report/', HTTP_X_AUTOMATION_KEY=''
        )
        self.assertEqual(response.status_code, 401)


@override_settings(MEDIA_ROOT=MEDIA_TMP, AUTOMATION_API_KEY='test-secret')
class RankUnrankedTests(TestCase):
    def _auth_post(self, url):
        return self.client.post(url, HTTP_X_AUTOMATION_KEY='test-secret')

    @patch('candidates.automation_views.rank_candidate')
    def test_respects_batch_cap_and_reports_remaining(self, mock_rank):
        # MAX_CANDIDATES_PER_BATCH + 2 unranked candidates -- one call should
        # only rank a full batch and report the other 2 as remaining.
        def fake_rank(candidate):
            candidate.ranking_score = 80
            candidate.ranking_computed_at = timezone.now()
            candidate.pass_fail = 'pass'
            candidate.save(update_fields=['ranking_score', 'ranking_computed_at', 'pass_fail'])
        mock_rank.side_effect = fake_rank

        for i in range(MAX_CANDIDATES_PER_BATCH + 2):
            _make_candidate(email=f'c{i}@example.com')

        response = self._auth_post('/api/automation/rank-unranked/')

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body['ranked'], MAX_CANDIDATES_PER_BATCH)
        self.assertEqual(body['failed'], 0)
        self.assertEqual(body['remaining'], 2)
        self.assertEqual(mock_rank.call_count, MAX_CANDIDATES_PER_BATCH)

    @patch('candidates.automation_views.rank_candidate')
    def test_one_failure_does_not_stop_the_batch(self, mock_rank):
        def fake_rank(candidate):
            if candidate.email == 'bad@example.com':
                raise RuntimeError('boom')
            candidate.ranking_score = 50
            candidate.ranking_computed_at = timezone.now()
            candidate.pass_fail = 'fail'
            candidate.save(update_fields=['ranking_score', 'ranking_computed_at', 'pass_fail'])
        mock_rank.side_effect = fake_rank

        _make_candidate(email='bad@example.com')
        _make_candidate(email='good@example.com')

        response = self._auth_post('/api/automation/rank-unranked/')

        body = response.json()
        self.assertEqual(body['ranked'], 1)
        self.assertEqual(body['failed'], 1)


@override_settings(MEDIA_ROOT=MEDIA_TMP, AUTOMATION_API_KEY='test-secret')
class DailyReportTests(TestCase):
    def test_orders_by_ranking_score_not_creation_order(self):
        today = timezone.localdate()
        low = _make_candidate(email='low@example.com')
        low.ranking_score = 40
        low.pass_fail = 'fail'
        low.ranking_computed_at = timezone.now()
        low.save(update_fields=['ranking_score', 'pass_fail', 'ranking_computed_at'])

        high = _make_candidate(email='high@example.com')
        high.ranking_score = 95
        high.pass_fail = 'pass'
        high.ranking_computed_at = timezone.now()
        high.save(update_fields=['ranking_score', 'pass_fail', 'ranking_computed_at'])

        response = self.client.get(
            f'/api/automation/daily-report/?date={today.isoformat()}',
            HTTP_X_AUTOMATION_KEY='test-secret',
        )

        body = response.json()
        ids_in_order = [c['id'] for c in body['candidates']]
        self.assertEqual(ids_in_order, [high.id, low.id])

    def test_unranked_candidates_are_excluded(self):
        _make_candidate(email='unranked@example.com')

        response = self.client.get(
            '/api/automation/daily-report/', HTTP_X_AUTOMATION_KEY='test-secret'
        )

        self.assertEqual(response.json()['candidates'], [])

    def test_includes_ranking_criteria_and_review_url(self):
        candidate = _make_candidate(email='criteria@example.com')
        candidate.ranking_score = 88
        candidate.pass_fail = 'pass'
        candidate.ranking_computed_at = timezone.now()
        candidate.ranking_criteria = [{'name': 'Discovery', 'score': 90, 'rationale': 'Strong'}]
        candidate.save(
            update_fields=['ranking_score', 'pass_fail', 'ranking_computed_at', 'ranking_criteria']
        )

        response = self.client.get(
            '/api/automation/daily-report/', HTTP_X_AUTOMATION_KEY='test-secret'
        )

        body = response.json()['candidates'][0]
        self.assertEqual(body['ranking_criteria'], candidate.ranking_criteria)
        self.assertEqual(body['review_url'], f'http://localhost:8000/qa/candidates/{candidate.id}/')


@override_settings(MEDIA_ROOT=MEDIA_TMP, AUTOMATION_API_KEY='test-secret')
class OutreachFeedTests(TestCase):
    def test_pending_nurture_only_lists_unenrolled_fails(self):
        failed = _make_candidate(email='fail@example.com', pass_fail='fail')
        _make_candidate(email='pass@example.com', pass_fail='pass')
        already_enrolled = _make_candidate(
            email='enrolled@example.com', pass_fail='fail', nurture_started_at=timezone.now()
        )

        response = self.client.get(
            '/api/automation/candidates/pending-nurture/', HTTP_X_AUTOMATION_KEY='test-secret'
        )

        ids = [c['id'] for c in response.json()['candidates']]
        self.assertEqual(ids, [failed.id])
        self.assertNotIn(already_enrolled.id, ids)

    def test_pending_invite_only_lists_uninvited_passes(self):
        passed = _make_candidate(email='pass@example.com', pass_fail='pass')
        _make_candidate(email='fail@example.com', pass_fail='fail')
        already_invited = _make_candidate(
            email='invited@example.com', pass_fail='pass', booking_invite_sent_at=timezone.now()
        )

        response = self.client.get(
            '/api/automation/candidates/pending-invite/', HTTP_X_AUTOMATION_KEY='test-secret'
        )

        ids = [c['id'] for c in response.json()['candidates']]
        self.assertEqual(ids, [passed.id])
        self.assertNotIn(already_invited.id, ids)

    def test_mark_contacted_is_idempotent(self):
        candidate = _make_candidate(email='pass@example.com', pass_fail='pass')

        for _ in range(2):
            response = self.client.post(
                '/api/automation/candidates/mark-contacted/',
                data=json.dumps({'candidate_id': candidate.id, 'type': 'invite'}),
                content_type='application/json',
                HTTP_X_AUTOMATION_KEY='test-secret',
            )
            self.assertEqual(response.status_code, 200)

        candidate.refresh_from_db()
        self.assertIsNotNone(candidate.booking_invite_sent_at)

        # Now excluded from pending-invite.
        response = self.client.get(
            '/api/automation/candidates/pending-invite/', HTTP_X_AUTOMATION_KEY='test-secret'
        )
        self.assertEqual(response.json()['candidates'], [])

    def test_mark_contacted_rejects_unknown_type(self):
        candidate = _make_candidate(email='x@example.com')

        response = self.client.post(
            '/api/automation/candidates/mark-contacted/',
            data=json.dumps({'candidate_id': candidate.id, 'type': 'bogus'}),
            content_type='application/json',
            HTTP_X_AUTOMATION_KEY='test-secret',
        )

        self.assertEqual(response.status_code, 400)

    def test_mark_contacted_unknown_candidate_404s(self):
        response = self.client.post(
            '/api/automation/candidates/mark-contacted/',
            data=json.dumps({'candidate_id': 999999, 'type': 'invite'}),
            content_type='application/json',
            HTTP_X_AUTOMATION_KEY='test-secret',
        )

        self.assertEqual(response.status_code, 404)
