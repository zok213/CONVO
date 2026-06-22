# WaveLens Core Architectures: Expert Implementation (June 2026)

This document provides a highly rigorous, production-grade breakdown of the core methods and pipelines within the WaveLens ecosystem. It is written from the perspective of an AI Systems Engineer deploying in harsh, edge-network industrial environments.

*Note: This architectural overview focuses on the software, edge network, and cloud routing layers, explicitly detailing fault tolerance, state machines, and hardware-software bridging.*

---

## 1. Dual-Channel Real-Time Translation Pipeline

The core challenge of live voice-to-voice translation in industrial settings is balancing ultra-low latency with high semantic accuracy. WaveLens utilizes a Dual-Channel approach over the Agora SDRTN (Software Defined Real-time Network).

```text
    [ BLUETOOTH HARDWARE ]         [ MOBILE WEB BROWSER (EDGE) ]                        [ AGORA CLOUD / CAI ENGINE ]
 
                                     +-----------------------+      (Raw Opus Stream)     +--------------------------+
      (HFP - 16kHz Mono)             | Microphone WebRTC API | -------------------------> | Agora WebRTC Gateway     |
  +------------------------+         | Constraint Injection: |                            +------------+-------------+
  | Shokz Bone-Conduction  | ------> | AEC, ANS, AGC         |                                         |
  | (Worker input)         |         +-----------------------+                                         v
  +------------------------+                     ^                                        +--------------------------+
            |                                    |                                        | VAD (Voice Activity)     |
            |                            +-------+-------+                                | Threshold: 0.75s silence |
            |                            |               | <--- (EN Text Stream) -------- +------------+-------------+
            |                            | React Client  |                                             |
            |                            | State Manager |                                             v
            |                            |               |                                +--------------------------+
            |                            | - Renders UI  | <--- (VI Text Stream) -------- | Speech-to-Text (STT)     |
            |                            +-------+-------+                                +------------+-------------+
            |                                    |                                                     |
            |                                    v                                                     v
            |                            +-------+-------+      (Synthesized Opus)        +--------------------------+
            +--------------------------- | Audio Routing | <----------------------------- | Translation LLM Engine   |
              (A2DP - 44.1kHz Stereo)    | (OS Level)    |                                | (gpt-realtime-2)         |
              (Direct to headset)        +---------------+                                +--------------------------+
```

### Engineering Rationale & Core Methods
- **`useLocalMicrophoneTrack({ AEC: true, ANS: true, AGC: true })`**: 
  - *The "Why":* Bluetooth HFP (Hands-Free Profile) degrades audio to narrow-band 16kHz to support bidirectional data. If raw HFP audio hits the cloud LLM, the hallucination rate spikes due to wind and machinery noise. We force Acoustic Echo Cancellation, Noise Suppression, and Gain Control at the WebRTC client layer *before* encoding to Opus.
- **`client.on('stream-message')`**: 
  - *The "Why":* Relying solely on audio playback leaves workers blind if the environment is too loud. We subscribe to parallel data channels injecting real-time text representations of the audio payload.
- **Hardware Routing Bypass**:
  - *The "Why":* Mobile browsers (Safari/Chrome) do not expose native APIs (like Android's `AudioManager.setBluetoothScoOn()`) to force hardware routing. We designed the architecture to rely on the OS's native heuristic: when an active WebRTC session begins, the OS naturally prioritizes connected HFP devices.

---

## 2. Immutable Identity & On-Chain Audit (Metaplex Core)

Industrial safety compliance requires unalterable logs of translated commands. Storing full transcripts on-chain is cost-prohibitive. We utilize a hybrid model anchored to a Solana Soulbound NFT.

```text
       [ FRONTEND ]                  [ BACKEND NODE.JS ]                    [ SOLANA DEVNET ]

   +-------------------+        +---------------------------+        
   | Session Completed | -----> | POST /api/log-session     |        
   | (User triggers)   |        | { session_id, turns[] }   |        
   +---------+---------+        +-------------+-------------+        
             |                                |                    
             |  1. Await confirmation         |  2. Async Processing
             v                                v                    
   +-------------------+        +---------------------------+        +--------------------------+
   |   UI Loading      |        | SHA-256 Hash Generation   |        | METAPLEX CORE PROGRAM    |
   |   Spinner         |        | Upload JSON to Storage    |        |                          |
   +---------+---------+        +-------------+-------------+        |  +--------------------+  |
             |                                |                      |  | Soulbound NFT      |  |
             |  3. Poll for status            |  4. Umi transaction  |  | (Safety Pass)      |  |
             +------------------------------->|                      |  |                    |  |
                                              |------------------------>| - Non-transferable |  |
                                              |  5. Mint/Update      |  | - Attributes:      |  |
                                              |     AssetV1          |  |   hash, uri        |  |
                                              |                      |  +--------------------+  |
                                              |                      +--------------------------+
             6. Return { assetId }            |                                   |
   <------------------------------------------+                                   |
             |                                                                    |
             v                                                                    |
   +-------------------+                                                          |
   |  SessionSummary   |       7. Auditor Verification via Explorer               |
   |  (Solana Link)    | <--------------------------------------------------------+
   +-------------------+
```

### Engineering Rationale & Core Methods
- **`computeHash()`**: Generates a deterministic SHA-256 footprint of the bilingual `vi_texts` and `en_texts` array + timestamp.
- **Server-Side Custodial Minting (`recordReceipt()`)**:
  - *The "Why":* Port workers cannot be expected to install Phantom wallets or sign transactions mid-shift. The Node.js backend holds a securely managed `SOLANA_PRIVATE_KEY` that signs and pays for the NFT mint/update, achieving zero-friction blockchain logging.
- **`PermanentFreezeDelegate` (Metaplex Core)**: Ensures the "Safety Pass" NFT cannot be transferred, acting as a permanent, immutable worker identity and audit trail.

---

## 3. Strict Mode State Machine

A resilient WebRTC application must strictly manage the initialization lifecycle to prevent browser autoplay blocks and handle hardware permission states.

```text
      [ INIT ]
         |
         v
  +--------------+
  | Hydration    |  Wait for Next.js to mount client-side components.
  +------+-------+
         |
         v
  +--------------+
  | User Gesture |  Critical: Browsers block AudioContext creation without explicit click/touch.
  +------+-------+
         |
         v
      [ READY ]
         |
         v
  +--------------+
  | Hardware API |  navigator.mediaDevices.getUserMedia() - request Mic.
  +------+-------+
         |
         v (Success)
  +--------------+
  | CAI Start    |  POST /api/session/agent/start - spins up cloud LLM instance.
  +------+-------+
         |
         v
  +--------------+
  | RTC Connect  |  AgoraRTC client.join() and client.publish().
  +------+-------+
         |
         v
      [ LIVE ]
```

### Engineering Rationale
- **Readiness Guard (`useEffect`)**: Deliberately prevents any network or hardware calls until `isReady` is toggled via user interaction, aligning with strict modern browser autoplay policies.
- **Fail-Fast Error Handling**: If microphone access is denied at the `Hardware API` phase, the state machine reverts to `ERROR`, preventing ghost connections to the Agora CAI engine.

---

## 4. Mobile Hardware Reliability & Connection Guards

The most critical engineering layer. A mobile browser acting as an industrial IoT hub must survive OS-level interruptions, network faraday cages (containers), and aggressive background throttling.

```text
       [ MOBILE OS ]                  [ BROWSER ENGINE ]                    [ WEBRTC / AGORA ]

   +-------------------+        +---------------------------+        +-----------------------------+
   |   Screen Timeout  |--X---> |   Screen Wake Lock        |        |   Connection State Machine  |
   |   (Auto-Sleep)    | (Lock) |   navigator.wakeLock      |<------ |   DISCONNECTED              |
   +-------------------+        |   .request('screen')      |        |   RECONNECTING  <-- Guard   |
                                +---------------------------+        |   CONNECTED                 |
                                                                     +-----------------------------+
   +-------------------+        +---------------------------+
   |   Phone Call /    |        |   AudioContext Recovery   |                    |
   |   Siri / App Swap |------> |   visibilitychange event  |                    v
   |   (iOS Suspend)   |        |   .resume() on return     |        +-----------------------------+
   +-------------------+        +---------------------------+        |   Agora CAI Engine (Cloud)  |
                                                                     |   AEC + VAD + SAL + MLLM    |
   +-------------------+        +---------------------------+        +-----------------------------+
   | Bluetooth Headset |        |   Microphone Track        |
   | (HFP Profile)     |------> |   Constraints:            |
   +-------------------+        |   AEC: true  (Echo Cancel)|
                                |   ANS: true  (Noise Supp) |
                                |   AGC: true  (Gain Ctrl)  |
                                +---------------------------+
```

### Engineering Rationale & Core Methods
- **`navigator.wakeLock.request('screen')`**:
  - *The "Why":* Mobile OSs aggressively throttle or kill background JavaScript. If the screen sleeps during a 30-minute shift, the WebRTC thread terminates. We programmatically force the screen to remain active.
- **Web Audio Context Suspension Recovery (`visibilitychange` / `touchstart`)**:
  - *The "Why":* Known iOS Safari regression: If a worker receives a phone call, Safari flags the `AudioContext` as `suspended`. When the call ends, WebRTC is completely muted.
  - *The Fix:* We hook into `document.addEventListener('visibilitychange')` and `touchstart` to explicitly call `agoraClient.getAudioContext().resume()`, reviving the dead audio stream automatically.
- **`client.on('connection-state-change')`**:
  - *The "Why":* Ship hulls cause severe LTE/4G packet loss. Instead of failing silently, the app detects the `RECONNECTING` state and visually alerts the worker that the cloud connection is degraded, allowing them to reposition.
