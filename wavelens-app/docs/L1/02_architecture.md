# 02 Architecture

## High-Level Shape

```text
Browser /demo
  -> LiveSession
  -> POST /api/session/start
  -> Agora RTC join
  -> POST /api/session/agent/start
  -> POST /api/session/rtt/start
  -> publish mic after CONNECTED
  -> stream-message JSON/protobuf parsing
  -> POST /api/audit/hash for final bilingual turns
  -> POST /api/solana/record
  -> POST /api/session/end on cleanup
```

## Core Runtime

- `src/app/demo/page.tsx` owns the demo shell, domain/language controls, waveform, metrics drawer, and session remount key.
- `src/components/LiveSession.tsx` owns Agora RTC lifecycle, mic publication, agent/RTT startup, stream-message parsing, and cleanup.
- `src/app/api/session/*` owns privileged Agora operations.
- `src/app/api/solana/*` owns Metaplex Core receipt recording and verification.

## Pipeline

- Audio: browser microphone -> Agora RTC -> Agora CAI agent -> translated audio back to browser.
- Text: Agora stream-message payloads -> JSON/protobuf parser -> bilingual turn state.
- Audit: final bilingual turn -> SHA-256 hash -> Metaplex Core Safety Pass asset.

## Boundaries

- Browser never receives `NEXT_AGORA_APP_CERTIFICATE`.
- `AGORA_CUSTOMER_ID`, `AGORA_CUSTOMER_SECRET`, and `SOLANA_PRIVATE_KEY` are server-side only.
- STT translation can be unavailable without breaking agent-only demo mode.
