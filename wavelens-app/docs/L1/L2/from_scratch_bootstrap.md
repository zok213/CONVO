> **When to Read This:** Load this when rebuilding the WaveLens Demo MVP flow from scratch.

# From-Scratch Bootstrap

Minimum viable implementation:

1. Create Next.js App Router app with client demo page.
2. Add `.env.local.example` with `NEXT_PUBLIC_AGORA_APP_ID`, `NEXT_AGORA_APP_CERTIFICATE`, optional RTT, Solana, webhook, and LLM proxy vars.
3. Implement `/api/session/start` to mint RTC token and return canonical session shape.
4. Implement `/api/session/agent/start` with domain/language prompt and STT/LLM/TTS provider chain.
5. Implement `/api/session/rtt/start` with Agora STT REST join and standby `501` when optional creds are absent.
6. Implement `/api/session/end` to stop agent and RTT idempotently.
7. Implement `LiveSession` with mic permission, RTC join, `CONNECTED` publish guard, stream parsing, and cleanup.
8. Implement Metaplex Core Safety Pass record/verify routes.
9. Add `doctor`, `verify:api`, `typecheck`, and `verify` scripts.

Do not expose server secrets to client code.
