# WaveLens Lite Demo MVP Checklist

Last reviewed: 2026-06-24

Legend:

- `CODE-COMPLETE`: implemented in source and covered by local checks.
- `BLOCKED-EXTERNAL`: requires credentials, funding, hardware, network, or deployment outside the repo.
- `MANUAL-TEST`: implemented path exists, but must be verified with live hardware/services.
- `PRODUCTION-HARDENING`: intentionally out of Demo MVP scope.

## Code-Complete

| Item | Evidence |
| --- | --- |
| Canonical `/demo` flow uses `LiveSession` | `wavelens-app/src/app/demo/page.tsx` |
| Session token route returns app id, token, channel, uid, session id | `/api/session/start` |
| Agent route accepts domain and language context | `/api/session/agent/start` |
| RTT route starts Agora STT translation when REST creds exist | `/api/session/rtt/start` |
| RTT missing creds returns standby `501` | `/api/session/rtt/start` |
| Cleanup route accepts session, agent, and RTT IDs | `/api/session/end` |
| Mic publish waits for RTC `CONNECTED` | `LiveSession` |
| Stream parser supports JSON and protobuf STT messages | `LiveSession`, `lib/agora-stt.ts` |
| Solana record returns Metaplex Core `assetId` | `/api/solana/record` |
| Solana verify accepts `assetId` and `tx` alias | `/api/solana/verify` |
| Receipt attributes include `message_count` | `lib/solana-connection.ts` |
| Setup/contract scripts exist | `npm run doctor`, `npm run verify:api` |

## Manual-Test

| Item | Pass Criteria |
| --- | --- |
| Live Agora CAI session | User speaks, agent returns translated audio |
| RTT transcript stream | Text turns appear from Agora STT translation payloads |
| Language pair selection | Backend receives selected `langSrc` and `langTgt` |
| Session cleanup | End/unmount stops CAI, RTT, mic, and RTC once |
| Solana UI state | Successful mint marks receipt; failed mint shows error without crashing |
| Hardware path | Target phone and headset route mic/speaker correctly |

## Blocked-External

| Item | Required Action |
| --- | --- |
| Agora live demo | Configure valid Agora App ID and App Certificate |
| Agora RTT | Configure `AGORA_CUSTOMER_ID` and `AGORA_CUSTOMER_SECRET` |
| Solana record success | Provide funded devnet `SOLANA_PRIVATE_KEY` |
| Vercel/cloud deploy | Configure production env vars in host |
| Key safety | Rotate any credentials previously committed or shared |

## Production-Hardening

| Item | Reason Deferred |
| --- | --- |
| Route authentication | Demo MVP is local/hackathon-focused |
| Rate limiting | Needs deployment/runtime policy |
| Transcript storage backend | Demo records hash attributes only |
| Cryptographic transcript provenance | Requires provider-level signatures or TEE bridge |
| Monitoring/alerting | Needs production deployment target |
