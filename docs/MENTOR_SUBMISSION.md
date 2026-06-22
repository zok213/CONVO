# CONVO AI Hackathon — Mentor Check-in & Update Form

---

**1. Team Name**
WaveLens

---

**2. Current Project / Idea Name**
WaveLens Lite v8.0 — Industrial AI Voice Interpreter for Bone-Conduction Headsets

---

**3. The Problem Our Team Is Solving**

Language barriers in heavy industrial environments — specifically Vietnamese port workers (Da Nang) coordinating with international crews and supervisors — create serious operational and safety risks.

The problem has three compounding layers that generic translation apps cannot address:

- **Hands-free constraint**: Port workers, crane operators, and crew members cannot hold a phone to use Google Translate while operating equipment. A hands-free, voice-first interface is mandatory, not optional.
- **Extreme noise environment**: Dockyard machinery, ship engines, wind, and metallic echo make standard voice recognition fail badly. Raw audio pushed to a cloud LLM without preprocessing yields high error rates and dangerous mistranslations of safety commands.
- **No tamper-proof safety audit trail**: When a supervisor issues a safety order in English and a worker confirms in Vietnamese, there is currently no verifiable, immutable record. In the event of an accident, these verbal exchanges are legally critical but entirely unrecorded.

---

**4. Brief Solution Description**

WaveLens Lite is a fully hands-free, real-time AI voice interpreter that runs inside a mobile web browser — no app install required. The worker pairs a **Shokz bone-conduction headset** (which transmits audio through the skull, staying open-ear for situational awareness), and the system handles everything from there.

- **Voice-to-Voice translation** is delivered with low latency via the **Agora Conversational AI Engine** (CAI), routing through `gpt-realtime-2` with maritime-domain glossaries injected.
- **Immutable safety audit receipts** are anchored on **Solana** as Soulbound NFTs (via Metaplex Core), giving each work shift a cryptographically verifiable, non-transferable "Safety Pass" — without requiring the worker to install any crypto wallet.

---

**5. What Has the Team Accomplished So Far?**

The system is production-complete and hardware-demo-ready as of June 21, 2026. Key engineering milestones:

**A. Dual-Channel Audio + Text Pipeline (Fully Implemented)**
We built a parallel processing architecture over the Agora SDRTN network:
- *Voice Channel*: Raw audio captured by the browser via `getUserMedia` → WebRTC-level `AEC + ANS + AGC` preprocessing → encoded as Opus and streamed to the Agora CAI Engine → LLM translates and returns synthesized speech → OS routes audio to the Shokz headset via Bluetooth A2DP.
- *Text Channel*: Simultaneously, Agora's Real-Time Transcription (RTT) service produces a bilingual Vietnamese + English text stream, subscribed to via `client.on('stream-message')`, which drives on-screen subtitle rendering and the audit log pipeline.

**B. Solana Custodial Backend (Fully Implemented)**
A zero-friction, server-side Solana integration using `@metaplex-foundation/umi`:
- At session end, the backend computes a `SHA-256` hash of the full bilingual transcript, uploads the raw JSON to off-chain storage, and then mints or updates a Soulbound NFT (Metaplex Core `AssetV1`) using a custodial wallet.
- The NFT's `Attributes` plugin stores the `audit_hash` and `audit_uri`, and is frozen permanently via `PermanentFreezeDelegate`. No Phantom wallet, no browser extension, no friction for the worker.

**C. Mobile Hardware Reliability Guards (Fully Implemented)**
We identified and engineered around 4 critical failure modes unique to mobile web + Bluetooth hardware:
1. **Screen Wake Lock** (`navigator.wakeLock.request('screen')`): Prevents the OS from killing the WebRTC JS thread when the phone screen sleeps mid-shift.
2. **iOS AudioContext Recovery** (`visibilitychange` + `touchstart` listeners): iOS Safari suspends the Web Audio API when a phone call is received. We force `AudioContext.resume()` on the worker's return, eliminating silent audio failures.
3. **Connection State Recovery** (`client.on('connection-state-change')`): Explicitly handles `RECONNECTING` states caused by Faraday-cage signal loss inside steel shipping containers, alerting the worker instead of failing silently.
4. **HFP Bandwidth Compensation** (`AEC: true, ANS: true, AGC: true` WebRTC constraints): Bluetooth HFP profile caps audio at 16kHz narrowband. Without explicit browser-level preprocessing, wind and machinery noise caused severe LLM hallucination on safety-critical commands.

---

**6. How We Use the Agora Conversation AI Engine**

Agora CAI serves as the core real-time intelligence layer. Our integration follows a hardware-optimized pipeline:

1. The mobile browser captures audio through `getUserMedia` and applies WebRTC constraints (AEC/ANS/AGC) at the edge before any data leaves the device.
2. The cleaned Opus audio stream is published to the Agora channel via `useLocalMicrophoneTrack` and `usePublish`.
3. The Agora CAI Engine hosts two agent instances per session:
   - **Agent A**: Subscribed to the worker's stream, configured with Vietnamese input and English output with a maritime safety glossary injected via `system_message`.
   - **Agent B** (supervisor-facing): Mirrors the reverse direction.
4. The translated audio output is delivered back over the Agora channel, where the OS routes it natively to the paired Bluetooth headset (A2DP profile).
5. In parallel, Agora RTT surfaces a real-time bilingual text stream that drives the subtitle overlay and audit pipeline via `useClientEvent('stream-message')`.

---

**7. How We Implement Solana Integration**

Our Solana integration follows a hybrid on-chain/off-chain model to balance cost, speed, and immutability:

| Layer | What Is Stored | Where |
|---|---|---|
| Off-chain | Full raw bilingual transcript JSON | Backend Storage (S3 / IPFS-compatible) |
| On-chain | SHA-256 hash + storage URI | Solana Devnet — Metaplex Core NFT Attribute |

**Flow:**
1. Worker taps "End Session" on the mobile UI.
2. Backend (`POST /api/solana/record`) computes the SHA-256 hash of all `vi_text` + `en_text` turn pairs and the session metadata.
3. The raw JSON is uploaded to off-chain storage and a URI is returned.
4. The backend's custodial wallet (funded with Devnet SOL) calls the Metaplex Core program via `@metaplex-foundation/umi` to mint or update a Soulbound NFT.
5. The NFT's `Attributes` plugin is updated with `{ audit_hash, audit_uri }` and frozen via `PermanentFreezeDelegate` — making it non-transferable and immutable.
6. The frontend receives the `assetId` and renders a direct Solana Explorer link in the `SessionSummary` component for the worker to share with their supervisor.

---

**8. Current Challenges / Areas Needing Mentor Support**

**Challenge: VAD-Induced Translation Latency ("Walkie-Talkie Delay")**

Our current implementation relies on Agora CAI's Voice Activity Detection (VAD) to determine when a speaker has finished a turn before triggering translation. The effective threshold is approximately 0.75 seconds of silence.

In practice: a crane supervisor issuing a multi-clause safety instruction ("Move the container to Bay 3, secure the lock, and confirm with the ground team") speaks for 15–25 seconds. The worker receives no translation until the entire utterance is complete, which creates a dangerous gap in time-critical scenarios.

**Specific mentor guidance requested:**
- Is there a supported Agora CAI configuration (API-level parameter or `enable_aivad` tuning) to enable **incremental/streaming translation** — where the LLM begins outputting translated tokens while the speaker is still talking?
- Alternatively, what is the recommended approach for **VAD chunking** in Agora's architecture to break long utterances into semantically meaningful sub-segments for progressive translation delivery?

---

**9. Link to Documentation / Demo / Repo**

*(A structured PDF containing live demo screenshots, hardware test photos (Shokz + mobile browser), and finalized ASCII architecture diagrams is being prepared and will be submitted separately.)*

---

**10. Team Representative Name**
Zok213

---

**11. Team Representative Contact**
*[Please fill in: Phone / Email / Telegram handle]*
