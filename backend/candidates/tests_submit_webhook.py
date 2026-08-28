import tempfile
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

MEDIA_TMP = tempfile.mkdtemp()


class _SyncThread:
    """Stand-in for threading.Thread that runs the target immediately and
    synchronously instead of on a background thread, so tests can assert on
    what the webhook call did without racing a real thread.
    """
    def __init__(self, target=None, args=(), kwargs=None, daemon=None):
        self._target = target
        self._args = args
        self._kwargs = kwargs or {}

    def start(self):
        self._target(*self._args, **self._kwargs)


def _valid_payload():
    return {
        'name': 'Jane Doe',
        'email': 'jane@example.com',
        'phone': '555-0100',
        'linkedin': 'https://linkedin.com/in/janedoe',
        'company': 'Acme Corp',
        'years': '5',
        'desired_ote': '$140k-$250k',
        'state': 'CA',
        'relocation': 'yes',
        'resume': SimpleUploadedFile('resume.pdf', b'%PDF-1.4 fake resume', content_type='application/pdf'),
    }


@override_settings(MEDIA_ROOT=MEDIA_TMP)
class SubmitCandidateWebhookTests(TestCase):
    @override_settings(N8N_SUBMIT_WEBHOOK_URL='')
    def test_submission_succeeds_with_no_webhook_configured(self):
        # The default, most common state -- must never require this webhook
        # to be set up for the public form to work.
        response = self.client.post('/api/candidates/', _valid_payload())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['result'], 'success')

    @override_settings(
        N8N_SUBMIT_WEBHOOK_URL='http://n8n.example.com/webhook/submit',
        AUTOMATION_API_KEY='test-secret',
    )
    @patch('candidates.views.threading.Thread', _SyncThread)
    @patch('candidates.views.urllib.request.urlopen', side_effect=TimeoutError('timed out'))
    def test_submission_still_succeeds_if_webhook_is_unreachable(self, mock_urlopen):
        # The candidate's data is already saved by the time this fires --
        # a slow/down n8n must never fail or delay the actual submission.
        response = self.client.post('/api/candidates/', _valid_payload())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['result'], 'success')
        self.assertTrue(mock_urlopen.called)

    @override_settings(
        N8N_SUBMIT_WEBHOOK_URL='http://n8n.example.com/webhook/submit',
        AUTOMATION_API_KEY='test-secret',
    )
    @patch('candidates.views.threading.Thread', _SyncThread)
    def test_webhook_is_called_with_candidate_id_and_auth_header(self):
        with patch('candidates.views.urllib.request.urlopen') as mock_urlopen:
            mock_urlopen.return_value.__enter__.return_value.read.return_value = b'{}'
            response = self.client.post('/api/candidates/', _valid_payload())

        candidate_id = response.json()['id']
        self.assertTrue(mock_urlopen.called)
        request_obj = mock_urlopen.call_args[0][0]
        self.assertEqual(request_obj.get_header('X-automation-key'), 'test-secret')
        self.assertIn(str(candidate_id).encode(), request_obj.data)
