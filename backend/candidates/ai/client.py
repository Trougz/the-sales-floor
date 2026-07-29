"""The only module in this codebase allowed to import `anthropic`.

Everything else (management commands, admin actions) calls
`extract_structured()` so the LLM provider/model can change in one place --
see AI_MODEL in settings -- without touching ranking or matching logic.
"""
import json

import anthropic
from django.conf import settings

MAX_TOKENS = 1536


class AIConfigurationError(RuntimeError):
    """Raised when ANTHROPIC_API_KEY isn't set. Callers should catch this and
    skip/log rather than let a whole batch command crash."""


def extract_structured(*, system: str, user_content: str, schema: dict) -> dict:
    """Call Claude with a JSON schema and return the parsed response dict.

    Uses output_config/json_schema (server-side structured output) so the
    response is guaranteed to match `schema` rather than relying on prompt
    instructions alone.
    """
    if not settings.ANTHROPIC_API_KEY:
        raise AIConfigurationError(
            'ANTHROPIC_API_KEY is not set -- see console.anthropic.com to create one.'
        )

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model=settings.AI_MODEL,
        max_tokens=MAX_TOKENS,
        system=system,
        messages=[{'role': 'user', 'content': user_content}],
        output_config={'format': {'type': 'json_schema', 'schema': schema}},
    )

    text = ''.join(block.text for block in response.content if block.type == 'text')
    return json.loads(text)
