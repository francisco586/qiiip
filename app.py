"""Bot de WhatsApp que responde mensajes usando Claude.

Flujo: Meta (WhatsApp Cloud API) envía cada mensaje entrante al webhook
POST /webhook → se llama al API de Claude con el historial de la
conversación → la respuesta se devuelve al chat vía Graph API.
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

WHATSAPP_TOKEN = os.environ["WHATSAPP_TOKEN"]
PHONE_NUMBER_ID = os.environ["WHATSAPP_PHONE_NUMBER_ID"]
VERIFY_TOKEN = os.environ["WHATSAPP_VERIFY_TOKEN"]
GRAPH_API_URL = f"https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages"

CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")
SYSTEM_PROMPT = os.environ.get(
    "SYSTEM_PROMPT",
    "Eres un asistente personal que responde mensajes de WhatsApp. "
    "Responde en el mismo idioma del usuario, de forma clara y breve "
    "(es una conversación de chat, no un ensayo).",
)

# WhatsApp rechaza cuerpos de texto de más de 4096 caracteres
WHATSAPP_MAX_CHARS = 4000
MAX_HISTORY_TURNS = 20

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("whatsapp-bot")

app = Flask(__name__)
claude = anthropic.Anthropic()  # usa ANTHROPIC_API_KEY del entorno

# Historial en memoria por número de teléfono. Para producción usa una
# base de datos (Redis, SQLite, etc.) — esto se pierde al reiniciar.
_histories: dict[str, list[dict]] = {}
_history_lock = threading.Lock()

# Meta reintenta entregas, así que deduplicamos por ID de mensaje.
_seen_ids: set[str] = set()
_seen_order: deque[str] = deque(maxlen=1000)


@app.get("/webhook")
def verify_webhook():
    """Verificación inicial del webhook que hace Meta al configurarlo."""
    if (
        request.args.get("hub.mode") == "subscribe"
        and request.args.get("hub.verify_token") == VERIFY_TOKEN
    ):
        return request.args.get("hub.challenge", ""), 200
    return "Token de verificación inválido", 403


@app.post("/webhook")
def receive_webhook():
    data = request.get_json(silent=True) or {}
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            for message in change.get("value", {}).get("messages", []):
                _dispatch(message)
    # Responder 200 rápido; si no, Meta reintenta y duplica mensajes.
    return "OK", 200


def _dispatch(message: dict) -> None:
    msg_id = message.get("id", "")
    if msg_id in _seen_ids:
        return
    _seen_ids.add(msg_id)
    _seen_order.append(msg_id)
    if len(_seen_ids) > _seen_order.maxlen:
        _seen_ids.intersection_update(_seen_order)

    sender = message.get("from")
    if not sender:
        return

    if message.get("type") != "text":
        send_whatsapp_text(sender, "Por ahora solo puedo responder mensajes de texto 🙂")
        return

    text = message["text"]["body"]
    log.info("Mensaje de %s: %s", sender, text[:200])
    threading.Thread(target=_answer, args=(sender, text), daemon=True).start()


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
    for i in range(0, len(body), WHATSAPP_MAX_CHARS):
        chunk = body[i : i + WHATSAPP_MAX_CHARS]
        resp = requests.post(
            GRAPH_API_URL,
            headers={"Authorization": f"Bearer {WHATSAPP_TOKEN}"},
            json={
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": {"body": chunk},
            },
            timeout=30,
        )
        if resp.status_code >= 400:
            log.error("Error enviando a WhatsApp (%s): %s", resp.status_code, resp.text)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
