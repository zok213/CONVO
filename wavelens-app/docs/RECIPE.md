---
recipe_version: 0.2.0
recipe_status: demo-mvp
extension_points:
  - api.session
  - prompts.translation
  - audit.metaplex-core
  - ui.demo
invariants:
  - canonical.demo-live-session
  - credentials.server-side
  - publish.after-connected
  - final-turn-audit-only
stable_contracts:
  - env.required
  - api.session-start
  - api.session-agent-start
  - api.session-rtt-start
  - api.session-end
  - api.solana-record
  - api.solana-verify
---

# WaveLens Demo MVP Recipe

WaveLens Lite is a demo MVP for browser-based industrial voice translation. The canonical implementation is `src/app/demo/page.tsx` plus `src/components/LiveSession.tsx` and the `/api/session/*` routes.

## Core Flow

1. Browser opens `/demo`.
2. `LiveSession` starts a session through `/api/session/start`.
3. Browser joins Agora RTC and waits for `CONNECTED`.
4. `/api/session/agent/start` starts an Agora CAI agent with domain and language context.
5. `/api/session/rtt/start` starts Agora STT translation when optional REST credentials exist; otherwise it returns standby `501`.
6. Final bilingual turns are hashed and recorded through `/api/solana/record`.
7. Cleanup calls `/api/session/end` with `agentId` and optional `rttAgentId`.

## Invariants

- Keep `NEXT_AGORA_APP_CERTIFICATE` server-side.
- Keep mic publish behind the RTC `CONNECTED` guard.
- Do not mark Solana receipt confirmed from a local hash alone.
- Treat hardware rehearsal, live Agora credentials, Solana funding, and deployment as external acceptance tasks.

## Extension Points

- Prompt/domain behavior: `src/app/api/session/agent/start/route.ts`.
- Agora STT translation: `src/app/api/session/rtt/start/route.ts`.
- Demo UI/session lifecycle: `src/components/LiveSession.tsx` and `src/app/demo/page.tsx`.
- Audit receipt model: `src/lib/solana-connection.ts` and `/api/solana/*`.
