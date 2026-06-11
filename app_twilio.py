"""Bot de WhatsApp vía Twilio (sandbox o número propio) que responde con Claude.

Twilio envía cada mensaje entrante como POST form-encoded a /webhook;
se responde 200 de inmediato y la respuesta de Claude se envía en un
hilo aparte mediante el API REST de Twilio.
"""

import logging
import os
import threading
from collections import deque

import anthropic
import requests
from dotenv import load_dotenv
from flask import Flask, request

load_dotenv()

TWILIO_ACCOUNT_SID = os.environ["TWILIO_ACCOUNT_SID"]
TWILIO_AUTH_TOKEN = os.environ["TWILIO_AUTH_TOKEN"]
# Número del sandbox de Twilio por defecto; cámbialo si tienes número propio.
TWILIO_WHATSAPP_FROM = os.environ.get("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
TWILIO_API_URL = (
    f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
)

CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")
SYSTEM_PROMPT = os.environ.get(
    "SYSTEM_PROMPT",
    "Eres un asistente personal que responde mensajes de WhatsApp. "
    "Responde en el mismo idioma del usuario, de forma clara y breve "
    "(es una conversación de chat, no un ensayo).",
)

# Twilio limita el cuerpo a 1600 caracteres por mensaje
TWILIO_MAX_CHARS = 1500
MAX_HISTORY_TURNS = 20

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("whatsapp-bot-twilio")

app = Flask(__name__)
claude = anthropic.Anthropic()  # usa ANTHROPIC_API_KEY del entorno

# Historial en memoria por número (se pierde al reiniciar; usa Redis/SQLite
# si lo necesitas persistente).
_histories: dict[str, list[dict]] = {}
_history_lock = threading.Lock()

# Twilio reintenta si el webhook falla; deduplicamos por MessageSid.
_seen_ids: set[str] = set()
_seen_order: deque[str] = deque(maxlen=1000)


@app.post("/webhook")
def receive_webhook():
    msg_id = request.form.get("MessageSid", "")
    sender = request.form.get("From", "")  # ej. "whatsapp:+5215512345678"
    text = request.form.get("Body", "").strip()

    if sender and text and msg_id not in _seen_ids:
        _seen_ids.add(msg_id)
        _seen_order.append(msg_id)
        if len(_seen_ids) > _seen_order.maxlen:
            _seen_ids.intersection_update(_seen_order)
        log.info("Mensaje de %s: %s", sender, text[:200])
        threading.Thread(target=_answer, args=(sender, text), daemon=True).start()

    # TwiML vacío: 200 inmediato, la respuesta real va por el API REST.
    return "<?xml version='1.0' encoding='UTF-8'?><Response></Response>", 200, {
        "Content-Type": "application/xml"
    }


def _answer(sender: str, text: str) -> None:
    try:
        with _history_lock:
            history = _histories.setdefault(sender, [])
            history.append({"role": "user", "content": text})
            messages = list(history)

        response = claude.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=16000,
            thinking={"type": "adaptive"},
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        reply = "".join(b.text for b in response.content if b.type == "text").strip()
        if not reply:
            reply = "No pude generar una respuesta, intenta de nuevo."

        with _history_lock:
            history.append({"role": "assistant", "content": reply})
            del history[: max(0, len(history) - 2 * MAX_HISTORY_TURNS)]

        send_whatsapp_text(sender, reply)
    except Exception:
        log.exception("Error respondiendo a %s", sender)
        send_whatsapp_text(sender, "Ocurrió un error procesando tu mensaje 😕 Intenta de nuevo.")


def send_whatsapp_text(to: str, body: str) -> None:
    for i in range(0, len(body), TWILIO_MAX_CHARS):
        chunk = body[i : i + TWILIO_MAX_CHARS]
        resp = requests.post(
            TWILIO_API_URL,
            auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
            data={"From": TWILIO_WHATSAPP_FROM, "To": to, "Body": chunk},
            timeout=30,
        )
        if resp.status_code >= 400:
            log.error("Error enviando vía Twilio (%s): %s", resp.status_code, resp.text)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
