> **When to Read This:** Load this when changing token/session credential behavior.

# Token Model

`POST /api/session/start` signs a short-lived RTC token server-side.

Required env:

- `NEXT_PUBLIC_AGORA_APP_ID`
- `NEXT_AGORA_APP_CERTIFICATE`

Response fields:

- `appId`
- `token`
- `channel`
- `uid`
- `sessionId`

The certificate never leaves server routes. The browser only receives the app id and signed token needed to join the generated channel.
