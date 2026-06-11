# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

WhatsApp bot that answers incoming messages with Claude, via Meta's official
WhatsApp Business Cloud API. Single Flask app (`app.py`):

- `GET /webhook` — Meta's webhook verification handshake.
- `POST /webhook` — receives messages, dedupes by message ID, replies via the
  Graph API after calling the Claude API (`claude-opus-4-8`, adaptive thinking).
- Per-phone-number conversation history is kept in memory (lost on restart).

Setup instructions (in Spanish) live in `README.md`.

## Commands

```bash
pip install -r requirements.txt
cp .env.example .env   # fill in tokens
python app.py          # dev server on port 8000
gunicorn -w 2 -b 0.0.0.0:8000 app:app   # production
```

There are no tests or linters configured yet.

## Conventions

- Required env vars (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
  `WHATSAPP_VERIFY_TOKEN`, `ANTHROPIC_API_KEY`) are read at import time —
  the app fails fast if any is missing.
- WhatsApp text bodies max out at 4096 chars; replies are chunked at 4000.
- The webhook must return 200 quickly (Meta retries otherwise), so Claude
  calls run in a background thread.
