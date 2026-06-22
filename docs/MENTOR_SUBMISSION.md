# CONVO AI Hackathon — Mentor Check-in Form
## Plain-text answers — copy each answer directly into the corresponding field

---

**1. Team name**

WaveLens

---

**2. Current project / idea name**

WaveLens Lite v8.0 — Hands-Free Industrial AI Voice Interpreter

---

**3. The problem your team is solving**

Port workers and industrial crews in Vietnam (e.g., Da Nang port) face a critical language barrier when coordinating with international supervisors and ship crews. Existing tools like Google Translate fail in this context for three reasons: (1) workers cannot hold a phone while operating equipment — a hands-free solution is mandatory; (2) environments are extremely noisy (machinery, wind, ship engines), causing raw voice recognition to fail on safety-critical commands; (3) there is no tamper-proof record of verbal safety orders exchanged across language barriers, creating legal and compliance gaps when incidents occur.

---

**4. Brief solution description**

WaveLens Lite is a real-time, hands-free AI voice interpreter running in a mobile web browser — no app install required. Workers pair a Shokz bone-conduction headset and speak naturally. The Agora Conversational AI Engine handles voice-to-voice translation with low latency, delivering the translated output directly to the headset. At the end of each session, a SHA-256 fingerprint of the full bilingual transcript is anchored on Solana as a Soulbound NFT (Metaplex Core), creating an immutable, verifiable safety audit record without requiring any crypto wallet from the worker.

---

**5. What has the team accomplished so far?**

The system is production-complete and hardware-demo-ready as of June 21, 2026.

(A) Dual-Channel Pipeline: We built a parallel voice + text pipeline over the Agora SDRTN network. The voice channel handles real-time voice-to-voice translation via the CAI Engine. The text channel runs Agora RTT simultaneously, producing a bilingual Vietnamese/English transcript that drives on-screen subtitles and the audit log.

(B) Solana Custodial Backend: A fully server-side Solana integration using @metaplex-foundation/umi. At session end, the backend automatically mints or updates a Soulbound NFT (non-transferable via PermanentFreezeDelegate) storing the session hash and off-chain transcript URI in the Attributes plugin. No wallet install required from the worker.

(C) Mobile Hardware Reliability — 4 critical guards implemented: (1) Screen Wake Lock API prevents the OS from killing the WebRTC thread when the phone screen sleeps. (2) visibilitychange + touchstart listeners force AudioContext.resume() when iOS Safari suspends audio after a phone call. (3) connection-state-change listener handles network drops inside steel containers. (4) AEC + ANS + AGC WebRTC constraints applied at the browser before audio reaches the cloud, compensating for Bluetooth HFP's narrow 16kHz bandwidth in noisy dock environments.

---

**6. How do you plan to use the Agora Conversation AI Engine?**

Agora CAI is our core real-time intelligence layer. The mobile browser applies WebRTC noise suppression (AEC/ANS/AGC) at the edge before any audio leaves the device, then publishes the cleaned Opus stream to the Agora channel. The CAI Engine runs two agent instances per session — one for the Vietnamese worker (output: English) and one for the English supervisor (output: Vietnamese) — each with a maritime domain glossary injected via system_message. Translated audio is returned over the Agora channel and the OS routes it natively to the Shokz headset via Bluetooth A2DP. Simultaneously, we subscribe to the RTT data stream via stream-message events to drive the subtitle overlay and audit log.

---

**7. How do you plan to implement Solana integration?**

We use a hybrid on-chain / off-chain model. The full raw transcript JSON is stored off-chain (backend storage). Only a SHA-256 hash of the bilingual transcript plus the storage URI are written on-chain. When a session ends, our Node.js backend (POST /api/solana/record) uses a custodial service wallet to sign and submit a Metaplex Core transaction on Solana Devnet. This mints or updates an AssetV1 Soulbound NFT — frozen permanently via PermanentFreezeDelegate — with the hash and URI stored in the Attributes plugin. The worker receives a direct Solana Explorer link in the session summary. No Phantom wallet, no browser extension, zero friction for an industrial worker.

---

**8. Current challenges or areas needing mentor support**

Our main challenge is VAD-induced translation latency. The Agora CAI Engine waits for a ~0.75 second silence (Voice Activity Detection threshold) before triggering translation. When a supervisor issues a multi-clause safety instruction lasting 15–25 seconds, the worker receives no translation until the entire utterance is complete — a dangerous gap in time-critical scenarios.

We need mentor guidance on two specific questions: (1) Is there a supported Agora CAI API parameter or enable_aivad configuration to enable incremental/streaming translation, where the LLM begins returning translated tokens while the speaker is still talking? (2) What is the recommended approach for VAD chunking in Agora's architecture to break long utterances into semantically complete sub-segments for progressive translation delivery?

---

**9. Link to documentation / demo / repo (if any)**

[Attached as files: PDF containing live demo screenshots, hardware test photos (Shokz headset + mobile browser), and system architecture diagrams]

---

**10. Team representative name**

Zok213

---

**11. Team representative contact details**

[Phone / Email / Telegram — please fill in before submitting]
