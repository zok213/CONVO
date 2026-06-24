# 03 Code Map

## Primary Files

- `src/app/demo/page.tsx`: demo shell, language/domain controls, session key, metrics drawer.
- `src/components/LiveSession.tsx`: Agora RTC client, mic track, CAI/RTT startup, stream parsing, cleanup.
- `src/app/api/session/start/route.ts`: signed RTC token, channel, uid, session id.
- `src/app/api/session/agent/start/route.ts`: CAI agent prompt, STT/LLM/TTS configuration.
- `src/app/api/session/rtt/start/route.ts`: Agora STT translation REST join.
- `src/app/api/session/end/route.ts`: idempotent CAI/RTT cleanup.
- `src/app/api/solana/record/route.ts`: validates hash and records Safety Pass.
- `src/app/api/solana/verify/route.ts`: fetches Metaplex Core attributes by `assetId`.
- `src/lib/solana-connection.ts`: Umi setup, Metaplex Core create/fetch logic.
- `src/lib/agora-stt.ts`: protobuf decoder for Agora STT translation messages.

## Change Targets

- Agent prompt/model/VAD: session agent route.
- Language routing: demo page and session agent/RTT routes.
- Transcript parsing: `LiveSession` and `agora-stt`.
- Solana receipt attributes: `solana-connection` and Solana API routes.
- Verification tooling: `scripts/doctor.mjs` and `scripts/verify-api-contracts.mjs`.

## Compatibility

Older quickstart-compatible routes remain in `src/app/api`, but docs and tests treat `/api/session/*` as canonical for the Demo MVP.
