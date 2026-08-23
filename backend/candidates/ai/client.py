"""The only module in this codebase allowed to import `anthropic`.

Everything else (management commands, admin actions) calls
`extract_structured()` so the LLM provider/model can change in one place --
see AI_MODEL in settings -- without touching ranking or matching logic.
"""
import json
import os

import anthropic
from django.conf import settings

MAX_TOKENS = 2048


class AIConfigurationError(RuntimeError):
    """Raised when ANTHROPIC_API_KEY isn't set. Callers should catch this and
    skip/log rather than let a whole batch command crash."""


def _missing_key_message() -> str:
    """Explain *how* the key is missing, not just that it is.

    A bare "not set" is a dead end when the var looks set in the Render
    dashboard -- the usual causes are a blank value, a key pasted under a
    different name, or the instance not having restarted since the var was
    added. Report which of those it is, without ever echoing a real key.
    """
    raw = os.environ.get('ANTHROPIC_API_KEY')
    if raw is None:
        detail = 'ANTHROPIC_API_KEY is absent from this process environment.'
    elif not raw.strip():
        detail = 'ANTHROPIC_API_KEY is present but its value is blank.'
    else:
        # Non-blank in os.environ but falsy in settings -- settings didn't
        # pick it up (stale process, or ANTHROPIC_API_KEY overridden later).
        detail = (
            f'ANTHROPIC_API_KEY is set in the environment (length {len(raw)}) but '
            'Django settings read it as empty -- the running process started '
            'before the value was added, so restart the service.'
        )

    # Catch "key pasted under the wrong name" -- but only vars that could
    # plausibly hold a key, or the list fills up with unrelated tooling vars.
    lookalikes = sorted(
        name for name in os.environ
        if name != 'ANTHROPIC_API_KEY'
        and ('ANTHROPIC' in name.upper() or 'CLAUDE' in name.upper())
        and any(word in name.upper() for word in ('KEY', 'TOKEN', 'SECRET'))
    )
    if lookalikes:
        detail += (
            f' Note these are set instead: {", ".join(lookalikes[:5])} -- the key '
            'must be named exactly ANTHROPIC_API_KEY.'
        )

    return (
        f'{detail} Set ANTHROPIC_API_KEY (exact name) on the salesfloor-api '
        'service in Render -> Environment, save, and wait for the redeploy. '
        'Create a key at console.anthropic.com.'
    )


def extract_structured(*, system: str, user_content: str, schema: dict) -> dict:
    """Call Claude with a JSON schema and return the parsed response dict.

    Uses output_config/json_schema (server-side structured output) so the
    response is guaranteed to match `schema` rather than relying on prompt
    instructions alone.
    """
    api_key = settings.ANTHROPIC_API_KEY.strip()
    if not api_key:
        raise AIConfigurationError(_missing_key_message())

    # max_retries: a transient network/rate-limit error otherwise fails the
    # candidate outright (see rank_candidate callers' per-candidate catch).
    client = anthropic.Anthropic(api_key=api_key, max_retries=2)
    response = client.messages.create(
        model=settings.AI_MODEL,
        max_tokens=MAX_TOKENS,
        # Ranking should be reproducible, not creative -- unset defaults to 1.0.
        temperature=0,
        system=system,
        messages=[{'role': 'user', 'content': user_content}],
        output_config={'format': {'type': 'json_schema', 'schema': schema}},
    )

    text = ''.join(block.text for block in response.content if block.type == 'text')
    return json.loads(text)
