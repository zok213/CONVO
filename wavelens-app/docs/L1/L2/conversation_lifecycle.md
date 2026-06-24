> **When to Read This:** Load this when changing how the `/demo` session starts, restarts, or ends.

# Conversation Lifecycle

1. `/demo` renders controls and mounts `LiveSession`.
2. `LiveSession` requests mic permission.
3. `POST /api/session/start` returns app id, token, channel, uid, and session id.
4. Browser joins Agora RTC.
5. `POST /api/session/agent/start` starts the CAI agent with domain/language context.
6. `POST /api/session/rtt/start` starts STT translation, or returns standby `501`.
7. Mic publishes only after `client.connectionState === 'CONNECTED'`.
8. Stream messages become turns.
9. Final bilingual turns can be hashed and recorded to Solana.
10. Cleanup calls `/api/session/end` with `sessionId`, `agentId`, and optional `rttAgentId`.

Changing domain or language remounts the session so backend context and UI state stay aligned.
