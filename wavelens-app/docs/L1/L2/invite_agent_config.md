> **When to Read This:** Load this when changing the CAI agent route.

# Agent Configuration

The canonical agent route is `src/app/api/session/agent/start/route.ts`.

Inputs:

- `channel`
- `uid`
- `domain`
- `langSrc`
- `langTgt`

Responsibilities:

- Validate required session fields and env vars.
- Build the system prompt from domain and target language.
- Configure Deepgram STT, OpenAI LLM, and MiniMax TTS.
- Bind the session to the browser user's UID.
- Return `agentId`, compatibility `agent_id`, and `state`.

Keep the route server-only because it uses `NEXT_AGORA_APP_CERTIFICATE`.
