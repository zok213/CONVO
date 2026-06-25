# Hackathon Project Submission — Copy-Paste Reference

---

## PROJECT NAME
WaveLens Lite

---

## TAGLINE
Real-time AI voice interpreter for industrial workers and the hearing-impaired — powered by Agora CAI, bone-conduction audio, and Solana audit trails.

---

## ABOUT / DESCRIPTION

### The Problem: Two Populations Left Behind

**1. Industrial Workers in Extreme Environments**

Port workers and industrial crews at locations like Da Nang Port — Vietnam's fastest-growing maritime hub targeting 16.77 million tonnes in 2026 — operate daily across a language barrier with Korean, Chinese, and English supervisors. Existing translation apps fail completely because:

- No hands available. Workers cannot hold a phone while operating cranes, forklifts, or ship rigging. Hands-free is non-negotiable.
- Noise is catastrophic. Ship engine rooms reach 110 dB(A). Standard voice recognition fails to capture safety-critical commands like "man overboard" in this acoustic environment.
- Zero audit trail. There is currently no tamper-proof record of verbal safety orders crossing language barriers — a massive legal liability under SOLAS maritime compliance when incidents occur.

**2. The Hearing-Impaired**

Standard audio translation is completely inaccessible for the deaf and hearing-impaired. Bone-conduction technology changes this fundamentally. By transmitting sound through vibrations in the skull bones directly to the cochlea, it bypasses damaged outer and middle ear structures — allowing individuals with sensorineural or conductive hearing loss to perceive speech that conventional headphones cannot deliver.

WaveLens Lite is purpose-built to serve both populations from the same architecture.

---

### The Solution: WaveLens Lite

WaveLens Lite is a real-time, hands-free AI voice interpreter that runs directly in a mobile web browser — no app installation required. Workers pair a Bluetooth bone-conduction device and speak naturally.

**Real-Time Voice-to-Voice Translation**
Powered by the Agora Conversational AI Engine (CAI v2.6). Vietnamese, English, Korean, and Chinese with sub-1.5 second latency using the gpt-realtime-2 model with a domain-specific maritime safety glossary injected at the agent level via system_message.

**Bone-Conduction Audio Delivery**
Translated audio is routed by the OS over Bluetooth A2DP/HFP to a bone-conduction device. This simultaneously serves two groups: workers in extreme noise (where conventional earphones are blocked by PPE), and hearing-impaired individuals for whom conventional speakers are non-functional.

**Edge Noise Suppression Pipeline**
WebRTC audio constraints (AEC, ANS, AGC) are applied at the browser level before audio is streamed to the cloud. This compensates for Bluetooth HFP's narrow 16kHz bandwidth and cleans the signal before it reaches the STT engine. Agora's enable_aivad and SAL (Selective Attention Locking) parameters are configured for 90 dB industrial environments.

**Parallel Bilingual Transcript**
The Agora RTT (Real-Time Transcription) and Translation Beta pipeline runs in parallel over the same SDRTN network, producing a bilingual Vietnamese/English text stream for on-screen subtitles. This also functions as a visual fallback for the hearing-impaired.

**Immutable Solana Audit Trail**
At session end, a SHA-256 fingerprint of the full bilingual transcript is anchored on Solana as a Soulbound NFT via Metaplex Core with PermanentFreezeDelegate. The raw transcript is stored off-chain. Only the hash and URI go on-chain, creating a tamper-proof safety compliance record. Zero wallet required from the worker — a custodial backend signs all transactions automatically.

---

### Architecture Highlights

The system is built as a dual-channel pipeline over the Agora SDRTN network:

Voice Channel: Mobile browser streams cleaned Opus audio via WebRTC to the Agora CAI Engine. The gpt-realtime-2 model translates and returns audio, which the OS routes to the Bluetooth bone-conduction device.

Text Channel: Agora RTT runs in parallel, converting speech to bilingual text (Vietnamese and English). At session end, the backend hashes this transcript and mints a Soulbound NFT on Solana Devnet via Metaplex Core.

Four mobile reliability guards are fully implemented in the codebase:
1. Screen Wake Lock API — prevents the OS from killing the WebRTC thread when the screen sleeps during a 30-minute shift.
2. AudioContext Recovery — visibilitychange and touchstart listeners force AudioContext.resume() when iOS Safari suspends audio after a phone call.
3. Connection State Guard — handles intermittent LTE drops inside steel shipping containers.
4. Browser-Level AEC/ANS/AGC — forces noise suppression at the edge before Bluetooth HFP's 16kHz bottleneck reaches the cloud.

Solana is designed for zero crypto friction: the custodial backend wallet signs all transactions and the worker receives a direct Solana Explorer link at the end of every session. The system is architected for the Alpenglow upgrade (Q3 2026), where sub-150ms finality will make receipts near-instant with no code changes required.

---

## BUILT WITH
Agora CAI Engine, Agora RTT, Agora Web SDK 4.23.4, Next.js 15, React 18, TypeScript, Solana, Metaplex Core, Deepgram Nova-3, WebRTC, Bone-Conduction Audio

---

## TRACK
Champion

---

## CATEGORY
Voice AI / Real-Time Communication / Web3 / AI Agents
