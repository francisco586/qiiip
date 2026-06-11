"""Punto de entrada: elige el proveedor según las variables de entorno.

Si TWILIO_ACCOUNT_SID está definida usa la integración Twilio;
si no, usa la WhatsApp Cloud API de Meta.
"""

import os

if os.environ.get("TWILIO_ACCOUNT_SID"):
    from app_twilio import app
else:
    from app import app

__all__ = ["app"]
