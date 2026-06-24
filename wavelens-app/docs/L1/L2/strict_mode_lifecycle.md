> **When to Read This:** Load this when touching RTC mount, microphone publish, or cleanup logic.

# Strict Mode Lifecycle

`LiveSession` owns RTC resources. Keep these rules:

- Create one Agora RTC client per mounted session.
- Request microphone permission before joining.
- Join RTC before starting mic publication.
- Wait for `client.connectionState === 'CONNECTED'` before `client.publish(track)`.
- Store `agentId` and `rttAgentId` in refs for cleanup.
- On unmount, call `/api/session/end`, stop/close the mic track, and leave RTC.

The parent demo page uses a session key from `domain`, `langSrc`, and `langTgt` to remount the session when context changes.
