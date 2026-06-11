# Bot de WhatsApp con Claude

Un bot que responde tus mensajes de WhatsApp usando Claude, a través de la
**API oficial de WhatsApp Business (Cloud API) de Meta**.

```
WhatsApp ──mensaje──▶ Meta Cloud API ──webhook──▶ este servidor ──▶ API de Claude
WhatsApp ◀─respuesta── Meta Cloud API ◀──────────┘
```

> ⚠️ No uses librerías no oficiales (whatsapp-web.js, Baileys, etc.) para
> automatizar tu cuenta personal: violan los términos de WhatsApp y pueden
> hacer que te bloqueen el número. La Cloud API es la vía oficial y tiene
> capa gratuita.

## Atajo: Twilio Sandbox (la opción más fácil)

Si la consola de Meta te resulta engorrosa, el sandbox de WhatsApp de
[Twilio](https://www.twilio.com) es mucho más rápido de configurar (ideal
desde el teléfono):

1. Crea una cuenta en twilio.com y verifica tu correo y teléfono.
2. En la consola: **Messaging → Try it out → Send a WhatsApp message**.
   Verás el número del sandbox y un código tipo `join algo-algo`.
3. Desde tu WhatsApp, envía ese `join algo-algo` al número del sandbox.
4. Copia el **Account SID** y el **Auth Token** (portada de la consola).
5. Despliega este repo (Railway, etc.) con las variables
   `ANTHROPIC_API_KEY`, `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN`
   (el entrypoint `wsgi.py` detecta Twilio automáticamente).
6. En la página del sandbox, en **"When a message comes in"**, pega
   `https://TU-URL/webhook` (método POST) y guarda.
7. Escríbele al número del sandbox: Claude responde.

Limitaciones del sandbox: el número es compartido y, tras 72 h sin
actividad, debes reenviar el `join`. Para algo permanente usa la Cloud API
de Meta (abajo) o un número propio de Twilio.

## Requisitos

1. **API key de Anthropic** — créala en <https://platform.claude.com>.
2. **Cuenta de desarrollador de Meta** — <https://developers.facebook.com>.
3. **Python 3.10+**.

## Paso 1 — Crear la app de WhatsApp en Meta

1. En <https://developers.facebook.com> crea una app de tipo **Business**.
2. En el panel de la app, agrega el producto **WhatsApp**.
3. Entra a **WhatsApp → API Setup**. Ahí Meta te da:
   - Un **número de teléfono de prueba** gratuito (sirve para empezar; luego
     puedes registrar tu propio número de empresa).
   - El **Phone number ID** → cópialo a `WHATSAPP_PHONE_NUMBER_ID`.
   - Un **access token temporal** (24 h) → cópialo a `WHATSAPP_TOKEN`.
4. En esa misma pantalla, en **"To"**, agrega tu número personal como
   destinatario de prueba (te llega un código por WhatsApp para confirmarlo).

## Paso 2 — Configurar y correr el servidor

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edita .env con tus valores
python app.py          # escucha en el puerto 8000
```

El webhook necesita una URL pública HTTPS. Para desarrollo, usa
[ngrok](https://ngrok.com):

```bash
ngrok http 8000
```

Copia la URL que te da (p. ej. `https://abc123.ngrok-free.app`).

## Paso 3 — Conectar el webhook en Meta

1. En tu app de Meta: **WhatsApp → Configuration → Webhook → Edit**.
2. **Callback URL**: `https://abc123.ngrok-free.app/webhook`
3. **Verify token**: el mismo valor que pusiste en `WHATSAPP_VERIFY_TOKEN`.
4. Guarda (Meta hace una petición GET de verificación; si el servidor está
   corriendo, pasa al instante).
5. En **Webhook fields**, suscríbete al campo **`messages`**.

## Paso 4 — Probar

Escribe un mensaje de WhatsApp desde tu número personal al número de prueba.
Claude te responderá en el mismo chat, recordando el contexto de la
conversación.

## Para dejarlo en producción

- **Token permanente**: el token de API Setup caduca en 24 h. Crea un
  *System User* en <https://business.facebook.com> (Configuración del negocio
  → Usuarios → Usuarios del sistema), asígnale la app y genera un token
  permanente con el permiso `whatsapp_business_messaging`.
- **Hosting**: despliega en cualquier servicio con HTTPS (Railway, Render,
  Fly.io, Cloud Run…) en lugar de ngrok, y ejecuta con un servidor WSGI:
  `gunicorn -w 2 -b 0.0.0.0:8000 app:app`.
- **Historial**: el historial de conversación vive en memoria; si reinicias
  el servidor se pierde. Para persistirlo, cámbialo por Redis o SQLite.
- **Tu propio número**: en Meta puedes registrar un número real (no puede
  estar activo en la app normal de WhatsApp al mismo tiempo). Las respuestas
  a mensajes entrantes dentro de la ventana de 24 horas son del tipo
  "servicio" y tienen capa gratuita generosa.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic |
| `WHATSAPP_TOKEN` | Access token de la Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID (de API Setup) |
| `WHATSAPP_VERIFY_TOKEN` | Frase secreta que tú inventas para verificar el webhook |
| `CLAUDE_MODEL` | Opcional, por defecto `claude-opus-4-8` |
| `SYSTEM_PROMPT` | Opcional, personalidad/instrucciones del bot |
| `PORT` | Opcional, por defecto `8000` |
