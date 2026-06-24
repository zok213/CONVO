> **When to Read This:** Load this when changing transcript parsing, turn state, or audit behavior.

# Transcript Pipeline

`LiveSession` listens to Agora `stream-message` events.

Supported payloads:

- JSON messages with transcript/translation fields.
- Agora STT protobuf messages decoded by `src/lib/agora-stt.ts`.

Turn behavior:

- Each parsed payload becomes a `Turn`.
- Non-final turns are displayed but not recorded to Solana.
- Final bilingual turns call `/api/audit/hash`.
- A hash is recorded through `/api/solana/record`.
- `hashConfirmed` becomes true only after Solana returns success.

If Solana minting fails, UI state moves to `error` but the live voice session continues.
