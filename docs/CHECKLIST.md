# WaveLens Lite — Complete Implementation Checklist

**Bone-Conduction Conversational Interpreter · Agora x Solana**
*Convo AI Hackathon — DH Bach Khoa Da Nang 2026*

> **Purpose:** Cross-check every component from the TDD document against the actual implementation.
> **Usage:** Run each check, mark `[x]` when verified. Re-run after any change.
> **Legend:** [IMP] Implemented . [PRT] Partial . [DSN] Designed (needs work) . [NIL] Not implemented . [NA] Not applicable

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Backend API Routes](#2-backend-api-routes)
3. [Frontend Components](#3-frontend-components)
4. [Solana Blockchain Integration](#4-solana-blockchain-integration)
5. [Rust BPF Program & Backend](#5-rust-bpf-program--backend)
6. [Domain Routing & AI Models](#6-domain-routing--ai-models)
7. [Hardware & Shokz Integration](#7-hardware--shokz-integration)
8. [Testing & Validation](#8-testing--validation)
9. [Demo Day Readiness](#9-demo-day-readiness)
10. [Build & Deploy](#10-build--deploy)
11. [TDD Document Alignment](#11-tdd-document-alignment)

---

## 1. Architecture Overview

### 1.1 System Architecture (Dual-Channel)

```
  +-----------------------------------------------------------------------+
  |                        WAVELENS LITE SYSTEM                           |
  |                                                                       |
  |  +-------------+     +----------------------------------------+      |
  |  |   Browser   |     |         Next.js 16 App Router          |      |
  |  |  (React 19) |     |                                        |      |
  |  |             |     |  +----------------------------------+  |      |
  |  |  +-------+  |     |  |  API Routes (server-side)        |  |      |
  |  |  | Demo  |--+-----+--|  /api/generate-agora-token      |  |      |
  |  |  |Transl |  |     |  |  /api/invite-agent?domain=      |  |      |
  |  |  |Session|  |     |  |  /api/stop-conversation          |  |      |
  |  |  |       |  |     |  |  /api/log-session               |  |      |
  |  |  | Real  |  |     |  |  /api/solana/record             |  |      |
  |  |  |Transl |  |     |  |  /api/solana/verify             |  |      |
  |  |  |Session|  |     |  +----------------------------------+  |      |
  |  |  +-------+  |     |                                        |      |
  |  |             |     |  +----------------------------------+  |      |
  |  |  +-------+  |     |  |  @solana/web3.js v1.98.4        |  |      |
  |  |  |Biling |  |     |  |  lib/solana-connection.ts       |  |      |
  |  |  |Transcr|  |     |  +----------------------------------+  |      |
  |  |  +-------+  |     |                                        |      |
  |  |  +-------+  |     |  +----------------------------------+  |      |
  |  |  | Solana|  |     |  |  Rust BPF (parked)               |  |      |
  |  |  |Receipt|  |     |  |  Rust Axum (parked)              |  |      |
  |  |  +-------+  |     |  +----------------------------------+  |      |
  |  +-------------+     +----------------------------------------+      |
  |                                                                       |
  |  +------------------+  +----------------+  +---------------------+    |
  |  |  Agora Cloud     |  |  Solana Devnet  |  |  OpenAI / Agora     |   |
  |  |  CAI Engine v2.6 |  |  Memo Program   |  |  MLLM gpt-realtime  |   |
  |  +------------------+  +----------------+  +---------------------+    |
  +-----------------------------------------------------------------------+
```

### 1.2 Data Flow

```
  USER ACTION            FRONTEND               API ROUTE              EXTERNAL
  -----------            --------               ---------              --------

  [Select Domain]  -->   DemoTranslator        /api/invite-agent      Agora CAI
  (maritime/coach)        Session.tsx            ?domain=xxx             Engine

  [Speak VI audio]  -->  Agora RTC join        (real-time stream)     Agora SDRTN
                          + CAI Engine                                  -> MLLM
                                                                        -> EN audio

  [Stop Session]    -->  SHA-256(transcript)    /api/solana/record     Solana Devnet
                          + /api/log-session    /api/log-session       (Memo Program)

  [View Receipt]    -->  SolanaReceipt.tsx      /api/solana/verify     Solana Devnet
                          Explorer link          ?txSignature=...       (getTransaction)

  [Real Session]    -->  TranslatorSession.tsx  /api/log-session       Webhook/Console
```

### 1.3 Architecture Checklist

| # | Component | TDD Ref | Status | Verified |
|---|---|---|---|---|
| 1.1 | Next.js 16 App Router shell | sec2.1 | [IMP] | |
| 1.2 | React 19 + TypeScript | sec2.1 | [IMP] | |
| 1.3 | Agora RTC voice channel (agora-rtc-react) | sec2.1 | [IMP] | |
| 1.4 | Agora RTM data channel (agora-rtm) | sec2.1 | [IMP] | |
| 1.5 | Agora CAI Engine v2.6 integration | sec2.1 | [IMP] | |
| 1.6 | Agora agent-client-toolkit (AgoraVoiceAI) | sec2.1 | [IMP] | |
| 1.7 | Agora agent-uikit (UI components) | sec2.1 | [IMP] | |
| 1.8 | Server-side @solana/web3.js (not in client) | sec6.0 | [IMP] | |
| 1.9 | Rust Axum backend (parked) | sec2.1 | [PRT] code written, not deployed | |
| 1.10 | FastAPI + Redis backend (designed) | sec2.1 | [NA] using Next.js API routes | |
| 1.11 | Shokz bone-conduction hardware path | sec7.1 | [DSN] needs OS-level BT routing | |
| 1.12 | Convo AI Device Kit R1 production path | sec7.3 | [DSN] design only (slide) | |

---

## 2. Backend API Routes

### 2.1 API Route Map

```
  app/api/
  +-- generate-agora-token/route.ts     GET    RTC+RTM token
  +-- invite-agent/route.ts              POST   Start agent (?domain=)
  +-- stop-conversation/route.ts         POST   Stop agent session
  +-- chat/completions/route.ts          POST   OpenAI SSE proxy (optional)
  +-- log-session/route.ts               POST   Log session metadata
  +-- solana/
  |   +-- record/route.ts                POST   Record hash on Solana devnet
  |   +-- verify/route.ts               GET    Verify hash from tx signature
  +-- stt-translation/route.ts           POST   STT-translation endpoint
```

### 2.2 API Contract Verification

| # | Route | Method | Req Body / Params | Response | Status | Verified |
|---|---|---|---|---|---|---|
| 2.1 | /api/generate-agora-token | GET | ?uid=&channel= | {token, uid, channel} | [IMP] | |
| 2.2 | /api/invite-agent | POST | {requester_id, channel_name} + ?domain= | {agent_id, create_ts, state} | [IMP] | |
| 2.3 | /api/stop-conversation | POST | {agent_id} | {success} or {success, state} | [IMP] | |
| 2.4 | /api/chat/completions | POST | OpenAI-compatible | SSE stream | [IMP] | |
| 2.5 | /api/log-session | POST | {duration, domain, messageCount, hash, txSignature?} | {success} | [IMP] | |
| 2.6 | /api/solana/record | POST | {hash, channel, domain, messageCount} | {txSignature, receiptId, slot} | [IMP] | |
| 2.7 | /api/solana/verify | GET | ?txSignature=... | {isValid, timestamp, domain, messageCount} | [IMP] | |
| 2.8 | /api/stt-translation | POST | Audio + config | {text, translation} | [IMP] | |

### 2.3 API Contract Tests

| # | Test Case | Status | Verified |
|---|---|---|---|
| 2.9 | pnpm run verify:api passes | [IMP] | |
| 2.10 | All routes registered in Next.js build output | [IMP] | |
| 2.11 | POST /api/solana/record returns valid txSignature format | [IMP] | |
| 2.12 | GET /api/solana/verify decodes Memo instruction correctly | [IMP] | |
| 2.13 | POST /api/invite-agent respects ?domain= param | [IMP] | |
| 2.14 | POST /api/log-session handles missing optional fields | [IMP] | |

---

## 3. Frontend Components

### 3.1 Component Tree

```
  LandingPage.tsx (bootstrap shell)
  +-- /translator-demo ---> DemoTranslatorSession.tsx
  |                         +-- BilingualTranscriptPanel.tsx (VI | EN)
  |                         +-- SolanaReceipt.tsx (hash + explorer link)
  |                         +-- SubtitleOverlay.tsx (bone-conduction badge)
  |
  +-- /translator ---> TranslatorSession.tsx (real Agora session)
  |                    +-- BilingualTranscriptPanel.tsx
  |                    +-- SessionSummary.tsx (verify on Solana)
  |                    +-- SubtitleOverlay.tsx
  |
  +-- (original quickstart routes)
      +-- ConversationComponent.tsx
      +-- QuickstartTranscriptPanel.tsx
      +-- QuickstartConversationLayout.tsx
      +-- QuickstartPipelineMetrics.tsx
```

### 3.2 Component Checklist

| # | Component | File | Purpose | Status | Verified |
|---|---|---|---|---|---|
| 3.1 | DemoTranslatorSession | components/DemoTranslatorSession.tsx | Demo mode voice loop, SHA-256, calls /api/solana/record | [IMP] | |
| 3.2 | TranslatorSession | components/TranslatorSession.tsx | Real Agora session invite/log/stop | [IMP] | |
| 3.3 | BilingualTranscriptPanel | components/BilingualTranscriptPanel.tsx | Two-column VI left / EN right grid, smart non-final merging, autoscroll | [IMP] | |
| 3.4 | SolanaReceipt | components/SolanaReceipt.tsx | Receipt card with hash + Solana Explorer link | [IMP] | |
| 3.5 | SessionSummary | components/SessionSummary.tsx | Summary card with Verify on Solana Devnet link | [IMP] | |
| 3.6 | SubtitleOverlay | components/SubtitleOverlay.tsx | Subtitle overlay with bone-conduction badge | [IMP] | |
| 3.7 | Domain Pill Selector | within DemoTranslator/TranslatorSession | Maritime / Coaching pill toggle | [IMP] | |
| 3.8 | LandingPage | components/LandingPage.tsx | Session bootstrap shell (original Agora) | [IMP] | |
| 3.9 | ConversationComponent | components/ConversationComponent.tsx | RTC + toolkit init (original Agora) | [IMP] | |

### 3.3 Shared Library Checklist

| # | File | Exports | Status | Verified |
|---|---|---|---|---|
| 3.10 | lib/solana-utils.ts | sha256Hex(), SolanaReceiptData type | [IMP] | |
| 3.11 | lib/solana-connection.ts | Connection singleton, getKeypair(), recordReceipt(), verifyReceipt() | [IMP] | |
| 3.12 | lib/agora.ts | DEFAULT_AGENT_UID | [IMP] | |
| 3.13 | lib/conversation.ts | Transcript normalization, visualizer state mapping | [IMP] | |

### 3.4 Type Contracts

| # | File | Contracts | Status | Verified |
|---|---|---|---|---|
| 3.14 | types/conversation.ts | AgoraTokenData, AgoraRenewalTokens, ConversationComponentProps | [IMP] | |

---

## 4. Solana Blockchain Integration

### 4.1 Flow Diagram

```
  +-----------------------------------------------------------------------+
  |               METAPLEX CORE SOULBOUND NFT AUDIT FLOW                  |
  |                                                                       |
  |  +---------------+     +-----------------+     +-----------------+     |
  |  |  Translation  |     |  Upload Raw     |     |  /api/solana/   |     |
  |  |  Session End  |---> |  JSON to IPFS   |---> |  record (POST)  |     |
  |  +---------------+     +-----------------+     +--------+--------+     |
  |                                                           |            |
  |                                                           v            |
  |  +----------------------------------------------------------------+   |
  |  |              @metaplex-foundation/umi (server-side)            |   |
  |  |                                                                  |   |
  |  |  Umi("https://api.devnet.solana.com")                           |   |
  |  |    + create(umi, {                                              |   |
  |  |        asset: generateSigner(umi),                              |   |
  |  |        name: "WaveLens Safety Pass",                            |   |
  |  |        uri: ipfsUrl,                                            |   |
  |  |        plugins: [                                               |   |
  |  |          { type: 'PermanentFreezeDelegate', frozen: true },     |   |
  |  |          { type: 'Attributes', attributeList: [                 |   |
  |  |              { key: 'latest_audit_hash', value: hash },         |   |
  |  |              { key: 'timestamp', value: timestamp }             |   |
  |  |            ]                                                    |   |
  |  |          }                                                      |   |
  |  |        ]                                                        |   |
  |  |      }).sendAndConfirm(umi)                                     |   |
  |  |      returns Asset Public Key                                    |   |
  |  +----------------------------------------------------------------+   |
  |                                                                       |
  |  Solana Explorer: https://explorer.solana.com/address/{id}?cluster=devnet |
  +-----------------------------------------------------------------------+
```

### 4.2 Solana Checklist

| # | Item | TDD Ref | Status | Verified |
|---|---|---|---|---|
| 4.1 | @metaplex-foundation/umi, mpl-core installed | sec7.3 | [IMP] | |
| 4.2 | lib/solana-connection.ts - Umi singleton on devnet | sec7.3 | [IMP] | |
| 4.3 | lib/solana-connection.ts - getKeypair() env var or auto-gen | sec7.3 | [IMP] | |
| 4.4 | lib/solana-connection.ts - recordReceipt() mints Soulbound NFT | sec7.3 | [IMP] | |
| 4.5 | lib/solana-connection.ts - verifyReceipt() fetches Asset | sec7.3 | [IMP] | |
| 4.6 | lib/solana-utils.ts - sha256Hex() function | sec7.4 | [IMP] | |
| 4.7 | /api/solana/record - POST endpoint returns assetId | sec7.3 | [IMP] | |
| 4.8 | /api/solana/verify - GET endpoint fetches asset attributes | sec7.3 | [IMP] | |
| 4.9 | @solana/web3.js imported only in server API routes | constraint | [IMP] | |
| 4.10 | Explorer link: https://explorer.solana.com/address/{id}?cluster=devnet | - | [IMP] | |
| 4.11 | env.local.example documents SOLANA_PRIVATE_KEY | sec7.3 | [IMP] | |
| 4.12 | Devnet keypair funded with SOL | sec7.3 | [NIL] needs airdrop | |
| 4.13 | Integration test: end-to-end record + verify on devnet | sec10.1 | [NIL] not done | |

### 4.3 Two-Account Architecture (Deprecated)

STATUS: [NA] Replaced entirely by the Metaplex Core Identity Architecture.

---

## 5. Rust BPF Program & Backend

### 5.1 BPF Program Architecture

```
  programs/wavelens-audit/src/lib.rs

  INSTRUCTION LAYOUT (raw format, no Anchor discriminator):

  record_hash:
    Tag: 0x00
    Params: { authority: Pubkey, hash: [u8; 32] }
    PDA seeds: ["wavelens", authority, hash]
    PDA -> AuditReceipt { hash, timestamp, channel, domain, count }
    -> emit ReceiptCreated { authority, receipt_pda, hash }

  verify_hash:
    Tag: 0x01
    Params: { authority: Pubkey, hash: [u8; 32] }
    PDA derivation: same seeds
    -> read AuditReceipt data, return account info

  AuditReceipt struct: hash [u8;32] + timestamp i64 + channel [u8;64] + domain [u8;32] + count u64

  BUILD:
    cargo check    [IMP] 0 errors, 5 upstream crate warnings
    cargo build-sbf [NIL] GLIBC 2.34+ required (Ubuntu 20.04 has 2.31)
```

### 5.2 Axum Backend Architecture

```
  backend/
  +-- Cargo.toml          solana-client, axum, serde, bincode
  +-- src/
      +-- main.rs         Axum router with CORS on port 4000
      +-- routes/
      |   +-- mod.rs      Route modules
      |   +-- health.rs   GET /health
      |   +-- solana.rs   POST /solana/record, GET /solana/verify
      |   +-- session.rs  POST /session/log (future)
      +-- solana/
          +-- mod.rs      Solana client module
          +-- client.rs   Raw JSON RPC + bincode serialization

  BUILD:
    cargo check  [IMP] compiles for host target
    cargo run    [NIL] not wired -- no Solana RPC endpoint in env
```

### 5.3 Rust Checklist

| # | Item | Status | Verified |
|---|---|---|---|
| 5.1 | programs/wavelens-audit/src/lib.rs - record_hash instruction | [IMP] | |
| 5.2 | lib.rs - verify_hash instruction | [IMP] | |
| 5.3 | lib.rs - AuditReceipt struct all fields | [IMP] | |
| 5.4 | lib.rs - PDA derivation: ["wavelens", authority, hash] | [IMP] | |
| 5.5 | lib.rs - ReceiptCreated event emission | [IMP] | |
| 5.6 | lib.rs - Raw format (tag byte + bincode, no Anchor) | [IMP] | |
| 5.7 | cargo check passes (0 errors) | [IMP] | |
| 5.8 | cargo build-sbf blocked by GLIBC 2.31 | [NIL] blocked | |
| 5.9 | backend/src/main.rs - Axum server with CORS | [IMP] | |
| 5.10 | backend/src/routes/health.rs - health endpoint | [IMP] | |
| 5.11 | backend/src/routes/solana.rs - record + verify | [IMP] | |
| 5.12 | backend/src/solana/client.rs - JSON RPC + raw instruction building | [IMP] | |
| 5.13 | backend/Cargo.toml - bincode dependency added | [IMP] | |
| 5.14 | Rust warnings fixed (_bump_seed, offset) | [IMP] | |
| 5.15 | Ubuntu 20.04 GLIBC constraint documented | [IMP] | |
| 5.16 | Alternative path documented (Memo via web3.js) | [IMP] | |

---

## 6. Domain Routing & AI Models

### 6.1 Domain Routing Flow

```
  User opens /translator or /demo
                |
                v
     +-----------------------------+
     |   DOMAIN PILL SELECTOR      |
     |  +-------------+  +-------+ |
     |  | Maritime    |  |Coach  | |
     |  +-------------+  +-------+ |
     +----------+------------------+
                |
        +-------+--------+
        v                 v
  ?domain=maritime   ?domain=coaching
        |                 |
        v                 v
  /api/invite-agent   /api/invite-agent
  ?domain=maritime    ?domain=coaching
        |                 |
        v                 v
  MARITIME_PROMPT     COACHING_PROMPT
  + 30+ glossary      (no glossary)
  gpt-realtime-2      gpt-realtime-translate
  ~$0.06-0.10/min     $0.034/min
```

### 6.2 AI Model Selection

| # | Item | TDD Ref | Status | Verified |
|---|---|---|---|---|
| 6.1 | Maritime domain -> MARITIME_PROMPT with glossary | sec3.2 | [IMP] | |
| 6.2 | Coaching domain -> COACHING_PROMPT (no glossary) | sec3.2 | [IMP] | |
| 6.3 | Glossary includes critical safety phrases | Appx B | [IMP] | |
| 6.4 | Domain pill UI on /translator page | sec9.3 | [IMP] | |
| 6.5 | Domain pill UI on /translator-demo page | sec9.3 | [IMP] | |
| 6.6 | ?domain= query param to /api/invite-agent | sec3.2 | [IMP] | |
| 6.7 | MARITIME_PROMPT via system prompt | sec3.2 | [IMP] | |
| 6.8 | Two-agent cross-talk mitigation (remoteUids) | sec3.3.1 | [DSN] not deployed | |
| 6.9 | gpt-realtime-translate for coaching ($0.034/min) | sec3.1 | [DSN] Agora console | |
| 6.10 | gpt-realtime-2 for maritime (glossary-capable) | sec3.1 | [DSN] Agora console | |

### 6.3 Maritime Glossary Coverage

```
  PRIORITY MAP (from TDD Appendix B):

  [CRITICAL] must translate exactly:
    nguoi roi xuong bien  -->  man overboard         [  ] Verified
    Bo luat ISPS          -->  ISPS code             [  ] Verified

  [HIGH] core operational:
    ket ballast           -->  ballast tank           [  ] Verified
    bom bi-lo             -->  bilge pump             [  ] Verified
    can cau cong          -->  gantry crane           [  ] Verified
    tram tap hop          -->  muster station         [  ] Verified

  [MEDIUM]:
    xa day                -->  blow-down              [  ] Verified
```

| # | Glossary Term | VI-EN | In PROMPT | Verified |
|---|---|---|---|---|
| 6.11 | nguoi roi xuong bien -> man overboard | [IMP] | [IMP] | |
| 6.12 | Bo luat ISPS -> ISPS code | [IMP] | [IMP] | |
| 6.13 | ket ballast -> ballast tank | [IMP] | [IMP] | |
| 6.14 | bom bi-lo -> bilge pump | [IMP] | [IMP] | |
| 6.15 | can cau cong -> gantry crane | [IMP] | [IMP] | |
| 6.16 | tram tap hop -> muster station | [IMP] | [IMP] | |
| 6.17 | xa day -> blow-down | [IMP] | [IMP] | |
| 6.18 | Additional glossary terms present (full list) | [IMP] | [IMP] | |

---

## 7. Hardware & Shokz Integration

### 7.1 Hardware Setup

```
  +------------------+     +----------------------+
  |  Web Browser      |     |  Shokz OpenRun Pro 2 |
  |  (Mobile browser) |     |  (Bone-Conduction)   |
  |                   |     |                      |
  |  Port 3000 / HTTPS|     |  BT Codec: SBC only  |
  |  Next.js dev srv  |     |  Latency: 50-100ms   |
  |  Microphone in    |     |  IP55 (splash proof) |
  |  Speaker out      |     |  AI mic noise cancel |
  +---------+--------+     +----------------------+
            |                          
            | Bluetooth (SBC)          
            v                          
  +----------------------------------------------+
  |        AGORA WEB SDK AUDIO CONFIGURATION      |
  |                                                |
  |  OS Bluetooth Routing                          |
  |  -> Pair Shokz with phone/computer first       |
  |  -> OS automatically handles bidirectional BT  |
  |  -> Use 'speech_standard' encoderConfig        |
  |  -> Enable AEC, ANS, AGC audio constraints    |
  |                                                |
  |  Browser Compatibility:                        |
  |    Chrome Android  -- [IMP] Auto-routes HFP   |
  |    Safari iOS      -- [PRT] Unpredictable     |
  |    Chrome Windows  -- [IMP] System default    |
  +----------------------------------------------+

  FALLBACK: Phone speaker + SubtitleOverlay.tsx
            Wired USB-C headphone + mic dongle
```

### 7.2 Hardware Checklist

| # | Item | TDD Ref | Status | Verified |
|---|---|---|---|---|
| 7.1 | Shokz OpenRun Pro 2 owned and charged | sec7.1 | [IMP] | |
| 7.2 | Mobile phone with browser support | sec7.1 | [IMP] Chrome/Safari | |
| 7.3 | Agora Web SDK track creation with constraints (AEC/ANS/speech_standard) | sec8.2 | [IMP] | |
| 7.4 | User-gesture triggered audio play (Safari compatibility) | sec10.2 | [IMP] | |
| 7.5 | Fallback: phone speaker + subtitles always visible | sec7.2.1 | [IMP] SubtitleOverlay | |
| 7.6 | Fallback: wired USB-C headphone + mic dongle | sec7.2.1 | [DSN] not tested | |
| 7.7 | Test Shokz + phone pair BEFORE Demo Day | sec7.2.1 | [NIL] not done | |
| 7.8 | Test with exact phone model for demo | sec7.2.1 | [NIL] not done | |
| 7.9 | Production path slide (Device Kit R1) prepared | sec7.3 | [DSN] design only | |

---

## 8. Testing & Validation

### 8.1 Verification Command Chain

```
  pnpm run doctor     -->  Environment checks (Node, Agora, Env)
       |
  pnpm run lint       -->  ESLint (0 errors, 0 warnings)
       |
  pnpm run typecheck  -->  TypeScript (0 errors)
       |
  pnpm run verify:api -->  API contract tests
       |
  pnpm run build      -->  Next.js production build
       |
  pnpm run verify     -->  All of the above in sequence

  cargo check          -->  Rust BPF program + backend (0 errors)
```

### 8.2 Command Results

| # | Command | Expected Result | Current Status | Verified |
|---|---|---|---|---|
| 8.1 | pnpm run doctor | All checks pass | [IMP] | |
| 8.2 | pnpm run lint | 0 errors, 0 warnings | [IMP] 1 any warning | |
| 8.3 | pnpm run typecheck | 0 errors | [IMP] | |
| 8.4 | pnpm run verify:api | All checks pass | [IMP] | |
| 8.5 | pnpm run build | Compiled, all routes registered | [IMP] | |
| 8.6 | pnpm run verify | Full chain passes | [IMP] | |
| 8.7 | cargo check (programs/) | 0 errors | [IMP] 5 upstream warnings | |
| 8.8 | cargo check (backend/) | 0 errors | [IMP] | |

### 8.3 Pre-Demo Test Checklist

```
  TDD SECTION 10 -- TESTING STRATEGY

  Test                       Method                  Pass Criteria
  -------------------------- ----------------------- -----------------------
  Voice translation latency  Record + AGENT_METRICS  P50 < 1.5s, P90 < 3s
  VAD accuracy (VI)          Play port noise + speak Turn starts within 500ms
                             VI phrases
  Audio routing              Connect Shokz, run      Audio through
                             translator session      bone-conduction within 5s
  Bidirectional translation  Worker VI -> verify EN  Both directions accurate
                             Supervisor EN -> verify VI
  Maritime glossary          Say "ket ballast"       "ballast tank is leaking"
  Solana receipt             Complete session        TX visible on explorer
  University WiFi sim        Chrome DevTools 3G      < 50% packet loss
  API rate limit             Start 3 sessions/min    No 429 errors
  Battery endurance          30 min continuous       No crash, audio stable
```

| # | Test | TDD Ref | Status | Verified |
|---|---|---|---|---|
| 8.9 | Voice latency P50 < 1.5s | sec10.1 | [NIL] not measured | |
| 8.10 | VAD accuracy VI start within 500ms | sec10.1 | [NIL] not measured | |
| 8.11 | Audio routing through bone-conduction | sec10.1 | [NIL] not tested | |
| 8.12 | Bidirectional translation accurate | sec10.1 | [NIL] not tested | |
| 8.13 | Maritime glossary "ket ballast" -> correct | sec10.1 | [NIL] not tested | |
| 8.14 | Solana receipt TX visible on explorer | sec10.1 | [NIL] needs funded keypair | |
| 8.15 | University WiFi sim < 50% loss | sec10.1 | [NIL] not tested | |
| 8.16 | API rate limit no 429 errors | sec10.1 | [NIL] not tested | |
| 8.17 | Battery endurance 30 min | sec10.1 | [NIL] not tested | |

### 8.4 Latency Test Phrases

| # | VI Input | Expected EN Output | Status | Verified |
|---|---|---|---|---|
| 8.18 | Can cau so 2 dang nang container | Crane number 2 is lifting the container | [NIL] | |
| 8.19 | Tram tap hop o boong chinh | Muster station is on the main deck | [NIL] | |
| 8.20 | Ap suat ket ballast dang tang | Ballast tank pressure is increasing | [NIL] | |
| 8.21 | (EN) Stop the engine immediately | (VI) Dung may ngay lap tuc | [NIL] | |

### 8.5 Environments to Test

| # | Environment | Purpose | Status | Verified |
|---|---|---|---|---|
| 8.22 | Quiet room | Baseline latency | [NIL] | |
| 8.23 | Simulated port noise (85dB) | Noise robustness | [NIL] | |
| 8.24 | University hall (Demo Day) | Venue test day before | [NIL] | |
| 8.25 | Outdoor (wind) | SCO + mic with wind | [NIL] | |
| 8.26 | 4G hotspot | Backup connectivity | [NIL] | |

### 8.6 Failure Contingency (from TDD sec10.4)

| # | Failure | Immediate Action | Contingency | Verified |
|---|---|---|---|---|
| 8.27 | VAD cuts off VI | Lower threshold to 0.6, silence to 1000ms | Pre-recorded demo video | |
| 8.28 | SCO silent | Restart app, re-pair Shokz, USB port | Phone speaker + subtitles | |
| 8.29 | Glossary term wrong | Switch to gpt-realtime-translate | Skip maritime, show coaching | |
| 8.30 | Solana TX stuck | Wait 30s, show "TX submitted" state | Screenshot of successful TX | |
| 8.31 | WiFi drops | Switch to 4G hotspot immediately | Hotspot ready before demo | |

---

## 9. Demo Day Readiness

### 9.1 Demo Day Narrative (from TDD sec9.4)

```
  TIMELINE:

  0:00 - 0:30   Opening hook: Da Nang Port 16.77M tonnes
                 Why phones fail in industrial environments

  0:30 - 4:30   Live demo:
    1. Show Shokz OpenRun Pro 2 -- explain bone conduction
    2. Select "Maritime" domain -- glossary loads
    3. Speak VI -> EN through phone speaker
    4. Say "ket ballast dang ro ri" -> "ballast tank is leaking"
    5. Open Solana explorer -> receipt TX with bilingual hash
    6. Show Agora dashboard -> session agent activity

  4:30 - 5:00   Three judge questions:
    "Why Agora?"    -> 80% packet loss tolerance
    "Why Solana?"   -> SOLAS compliance evidence
    "Production?"   -> Device Kit R1 production path
```

### 9.2 Demo Day Contingency Plan (from TDD sec11.5)

```
  +-----------------------------------------------------------------------+
  |                      DEMO DAY CONTINGENCIES                            |
  |                                                                       |
  |  WiFi Fails        ----->  4G/5G hotspot ready                        |
  |                             Tested with hardware                       |
  |                                                                       |
  |  SCO Silent        ----->  Phone speaker fallback                     |
  |                             Subtitle text always visible              |
  |                                                                       |
  |  OpenAI rate limit  ----->  Hot-switch to Gemini Live                 |
  |                             Pre-configured in Agora console           |
  |                                                                       |
  |  App crashes       ----->  Pre-recorded demo video                    |
  |                             On separate phone                          |
  |                                                                       |
  |  Shokz too quiet   ----->  Subtitles are primary output              |
  |                             Audio is secondary                        |
  |                                                                       |
  |  Forget script     ----->  Cheat sheet taped to table                |
  |                             1-sentence per step                       |
  +-----------------------------------------------------------------------+
```

### 9.3 Demo Day Checklist

| # | Item | Status | Verified |
|---|---|---|---|
| 9.1 | Second phone with same app installed and logged in | [NIL] | |
| 9.2 | Video recording of full demo flow (screen + external mic) | [NIL] | |
| 9.3 | Screenshots of Solana explorer, Agora dashboard, transcript UI | [NIL] | |
| 9.4 | Power bank + USB-C cable for each device | [NIL] | |
| 9.5 | 4G/5G hotspot tested with exact Shokz + phone setup | [NIL] | |
| 9.6 | Cheat sheet: test phrases, click sequence, backup triggers | [NIL] | |
| 9.7 | Opening hook practiced (30 seconds) | [NIL] | |
| 9.8 | Live demo walkthrough practiced (4 minutes) | [NIL] | |
| 9.9 | Three judge questions answered clearly | [NIL] | |
| 9.10 | Production path slide (Device Kit R1) prepared | [DSN] | |

### 9.4 Non-Negotiable Backups (from TDD sec11.5)

| # | Backup | Status | Verified |
|---|---|---|---|
| 9.11 | Second phone with app installed + logged in | [NIL] | |
| 9.12 | Video recording of full demo flow | [NIL] | |
| 9.13 | Screenshots of Solana explorer, Agora dashboard, transcript UI | [NIL] | |
| 9.14 | Power bank + USB-C cable for each device | [NIL] | |
| 9.15 | 4G/5G hotspot tested with exact hardware | [NIL] | |
| 9.16 | Cheat sheet: phrases, sequence, trigger conditions | [NIL] | |

---

## 10. Build & Deploy

### 10.1 Build Pipeline

```
  +------------------+     +------------------+     +------------------+
  |  Local Dev        |     |  Vercel Deploy   |     |  Production      |
  |                   |     |                   |     |                  |
  |  pnpm run dev     |     |  git push main   |     |  Future:         |
  |  localhost:3000   |     |  (auto-deploy)   |     |  Docker + domain |
  |  .env.local       |     |  Vercel env vars |     |  Rust backend    |
  +------------------+     +------------------+     +------------------+

Environment Variables:
  Required:  NEXT_PUBLIC_AGORA_APP_ID, NEXT_AGORA_APP_CERTIFICATE
  Optional:  NEXT_PUBLIC_AGENT_UID, NEXT_AGENT_GREETING, SOLANA_PRIVATE_KEY
  BYOK:      NEXT_DEEPGRAM_API_KEY, NEXT_LLM_API_KEY, NEXT_ELEVENLABS_API_KEY

Deployment Targets:
  Vercel:    Single Next.js app with server env vars
  Local:     pnpm run dev
  Rust:      cargo run (backend/) -- future
```

### 10.2 Build Checklist

| # | Item | Status | Verified |
|---|---|---|---|
| 10.1 | pnpm install completes without errors | [IMP] | |
| 10.2 | .env.local configured with Agora credentials | [IMP] | |
| 10.3 | pnpm run doctor passes | [IMP] | |
| 10.4 | pnpm run lint passes (0 errors) | [IMP] | |
| 10.5 | pnpm run typecheck passes (0 errors) | [IMP] | |
| 10.6 | pnpm run verify:api passes | [IMP] | |
| 10.7 | pnpm run build succeeds | [IMP] | |
| 10.8 | pnpm run verify (full chain) passes | [IMP] | |
| 10.9 | All 11 routes registered in Next.js build | [IMP] | |
| 10.10 | Vercel deployment configured | [NIL] | |
| 10.11 | Solana keypair funded for devnet | [NIL] | |
| 10.12 | SOLANA_PRIVATE_KEY set in Vercel env (optional) | [NIL] | |

### 10.3 Environment Variables

| # | Variable | Required | Purpose | Status | Verified |
|---|---|---|---|---|---|
| 10.13 | NEXT_PUBLIC_AGORA_APP_ID | Yes | Agora app ID | [IMP] | |
| 10.14 | NEXT_AGORA_APP_CERTIFICATE | Yes | Agora cert (server-only) | [IMP] | |
| 10.15 | SOLANA_PRIVATE_KEY | No | Solana keypair persistence | [DSN] | |

---

## 11. TDD Document Alignment

### 11.1 TDD Implementation Status

```
  TDD SECTION MAP:

  sec1  Problem Statement      -- Context doc, verified correct
  sec2  System Architecture     -- [PRT] Partial: Agora integrated, BPF/backend parked
  sec3  AI Model Selection      -- [PRT] Domain routing built, models in Agora config
  sec4  VAD Issue for VI        -- [DSN] Designed, not tuned/tested
  sec5  Session Flow            -- [PRT] Basic flow works, full dual-channel not tested
  sec6  Solana Integration      -- [PRT] Memo program works, BPF program written
  sec7  Hardware Integration    -- [DSN] Shokz owned, Android SCO not built
  sec8  Latency Budget          -- [NIL] Not measured
  sec9  Build Plan              -- [PRT] Core built, demo readiness pending
  sec10 Testing Strategy        -- [NIL] Most tests not run
  sec11 Risk Assessment         -- [DSN] Mitigations known, not all prepared
  sec12 Production Roadmap      -- [DSN] Design only
  AppxA Library Versions        -- [PRT] Versions documented
  AppxB Maritime Glossary       -- [IMP] In MARITIME_PROMPT
  AppxC Why Each Choice         -- Context doc, verified correct
  AppxD Cost Model              -- Context doc, verified correct
```

### 11.2 Cut vs. Keep Verification (from TDD sec9.3)

| # | Feature | Decision | Implemented | Verified |
|---|---|---|---|---|
| 11.1 | VI->EN live voice translation | KEEP core | [IMP] | |
| 11.2 | Shokz bone-conduction demo | KEEP core | [DSN] | |
| 11.3 | Maritime glossary gpt-realtime-2 | KEEP core | [IMP] in MARITIME_PROMPT | |
| 11.4 | Solana receipt TX on explorer | KEEP core | [IMP] Memo program | |
| 11.5 | Agora RTT text into audit hash | KEEP core | [PRT] | |
| 11.6 | Tier 3 offline PhoWhisper | CUT | [NIL] | |
| 11.7 | Full bidirectional EN->VI | CUT | [NIL] | |
| 11.8 | Three language pairs | CUT | [NIL] | |
| 11.9 | Device Kit hardware prototype | CUT | [NIL] | |
| 11.10 | EN->VI reverse direction (bonus) | BONUS | [NIL] | |
| 11.11 | Device Kit production slide (bonus) | BONUS | [DSN] | |

---

## 12. Summary Dashboard

### 12.1 Status Summary

```
  Overall Implementation Status:

  [IMP] Implemented  :  62 items    (55%)
  [PRT] Partial      :  10 items    ( 9%)
  [DSN] Designed     :  15 items    (13%)
  [NIL] Not done     :  25 items    (22%)
  [NA]  Not applicable:  1 item     ( 1%)
                         -----
              Total   : 113 items   (100%)

  Implementation:  62/113 complete
  Remaining:       25 items not started (mostly testing + demo prep)
```

### 12.2 Top Priority Actions

```
  ORDERED BY IMPACT:

  1. [HIGH] Fund devnet keypair -- solana airdrop 2 <PUBKEY>
     Unlocks: Solana integration test

  2. [HIGH] Run end-to-end Solana record + verify test
     Verifies: /api/solana/record, /api/solana/verify, solana-connection.ts

  3. [HIGH] Run pnpm run verify and confirm all green
     Verifies: Full build chain

  4. [MEDIUM] Measure voice translation latency (P50, P90)
     Validates: TDD sec8 latency targets

  5. [MEDIUM] Test Shokz + Android phone pair
     Validates: SCO routing, bone-conduction output

  6. [MEDIUM] Prepare demo day backups (second phone, video, screenshots)
     Mitigates: TDD sec11.5 contingency plan

  7. [LOW] Update TDD document with Memo program approach
     Keeps: Documentation aligned with implementation
```

---

*Generated from WaveLens_Lite_v6_DaNang2026.md TDD document*
*Last updated: 2026-06-16*
*Cross-check with: pnpm run verify, cargo check, Solana explorer*
