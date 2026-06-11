# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

WhatsApp bot that answers incoming messages with Claude. Two interchangeable
Flask apps selected by `wsgi.py` at import time:

- `app.py` — Meta's official WhatsApp Business Cloud API (`GET /webhook`
  verification handshake + `POST /webhook` JSON events, replies via Graph API).
- `app_twilio.py` — Twilio WhatsApp (sandbox or own number); `POST /webhook`
  form-encoded, replies via Twilio REST API. Used when `TWILIO_ACCOUNT_SID`
  is set.

Both dedupe by message ID, call the Claude API (`claude-opus-4-8`, adaptive
thinking) in a background thread, and keep per-phone-number conversation
history in memory (lost on restart).

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
