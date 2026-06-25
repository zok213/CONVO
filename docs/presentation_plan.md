# WaveLens Lite — Hackathon Demo Day Presentation Plan
## Da Nang University of Technology — June 28, 2026

---

## PRESENTATION OVERVIEW

**Total time:** 5 minutes + 2 minutes Q&A
**Format:** Slides + live demo embedded at the midpoint
**Audience:** Judges (Agora + Solana ecosystem representatives), student peers
**Goal:** Win Champion track. Show working product, technical depth, real-world impact, and a compelling narrative.

**Narrative arc:** Pain → Human cost → Innovation → Technical proof → Demo → Business viability → Ask

---

## SLIDE STRUCTURE — 12 Slides

---

### SLIDE 01 — TITLE HOOK

**Duration:** 15 seconds
**Purpose:** Immediate attention. Do not waste the opening with a team introduction.

**Headline (large, full-bleed image background):**
> "Every day, a safety command gets lost in translation. At Da Nang port, that can kill someone."

**Visual:** Full-screen AI-generated image of Da Nang port at golden hour. Workers. Cranes. Scale.

**Bottom of slide (small type):**
WaveLens Lite — Real-Time AI Voice Interpreter
PiX.lab | Convo AI Hackathon 2026

**Speaker notes:**
Start talking before advancing. Let the image breathe for 3 seconds. Then: "This is Da Nang port. Sixteen million tonnes of cargo in 2026. Vietnamese workers coordinating with Korean and Chinese supervisors on live equipment. And right now, there is no good solution for what happens when they cannot understand each other."

---

### SLIDE 02 — THE PROBLEM (Two Populations)

**Duration:** 40 seconds
**Purpose:** Establish two separate target users. Both are real. Both are underserved.

**Left panel — INDUSTRIAL:**
Headline: "No hands. 110 dB. Zero margin for error."
- Workers cannot hold a phone while operating cranes and forklifts
- Industrial noise at 90–110 dB destroys standard voice recognition
- Mistranslated safety commands are a legal liability under SOLAS maritime law
- Da Nang port: 16.77 million tonnes target 2026, new COSCO Korean/Chinese routes added 2025

**Right panel — ACCESSIBILITY:**
Headline: "1 in 6 people has hearing loss. Every translation tool requires you to hear it."
- Standard audio translation is completely inaccessible for the deaf and hearing-impaired
- Bone-conduction technology bypasses damaged outer and middle ear via skull vibration
- Same device. Same platform. Completely different life impact.

**Visual:** Split image — left: port worker at crane controls, right: woman at meeting being excluded

**Design tip:** Use two columns with a strong color divider. Left column in warm orange (industrial), right column in calm blue (accessibility).

---

### SLIDE 03 — WHY EVERYTHING ELSE FAILS

**Duration:** 20 seconds
**Purpose:** Discredit existing solutions quickly. Build urgency.

**Table:**

| Solution | Hands-free | Noise-proof | Audit trail | Accessible |
|---|---|---|---|---|
| Google Translate | No | No | No | No |
| Human interpreter | Sometimes | Sometimes | No | No |
| Native app | Requires install | Sometimes | No | No |
| **WaveLens Lite** | **Yes** | **Yes** | **Yes — Solana** | **Yes — bone conduction** |

**Visual:** Simple table, last row highlighted in brand color.

**Speaker notes:** "Every existing option fails on at least two of these four requirements. WaveLens Lite is the first system built to solve all four simultaneously."

---

### SLIDE 04 — THE SOLUTION IN ONE SENTENCE

**Duration:** 10 seconds
**Purpose:** Crisp, memorable statement. Make the judges remember this.

**Full-slide quote (large typography):**

> "WaveLens Lite is a real-time, hands-free AI voice interpreter that runs in any mobile browser, powered by Agora CAI, and every session is permanently anchored on Solana."

**Subline:** No app install. Scan a QR code. Speak. Done.

**Visual:** Clean dark background. Single strong typeface. No clutter.

---

### SLIDE 05 — HOW IT WORKS (Architecture in 60 seconds)

**Duration:** 45 seconds
**Purpose:** Show you built something real. Technical judges will test you here.

**Diagram: Two-channel pipeline**

```
[Mobile Browser — getUserMedia — AEC/ANS/AGC]
        |
        | Opus stream — 16kHz — cleaned
        v
[Agora SDRTN — UDP — 80% packet-loss tolerant]
        |
   _____|_____
  |           |
  v           v
[Voice Channel]     [Text Channel]
Agora CAI v2.6      Agora RTT + Translation Beta
gpt-realtime-2      VI → EN bilingual text
Maritime Glossary           |
        |                   v
        v           SHA-256(vi_text + en_text)
[Translated Audio]          |
→ OS Bluetooth A2DP         v
→ Bone-conduction   [Metaplex Core Soulbound NFT]
  earphone          Solana Devnet
```

**Key callouts on slide:**
- "gpt-realtime-2 + maritime glossary via system_message — domain-specific safety terms never mistranslated"
- "SAL (Selective Attention Locking) + enable_aivad — tuned for 90 dB port noise"
- "Two AI agents per session — one per direction — remoteUids constraint architecture"
- "Custodial backend wallet — worker never touches crypto"

**Speaker notes:** Walk through the diagram left to right. Pause at the Solana box. "This is not a prototype architecture. Every component shown here is implemented and tested."

---

### SLIDE 06 — THE AGORA CAI STACK (Technical Deep Dive)

**Duration:** 30 seconds
**Purpose:** Prove Agora expertise. Judges from Agora will listen closely here.

**Content:**

**Model routing:**
- Maritime domain (port, ship, crane commands): `gpt-realtime-2` via Agora MLLM + maritime glossary in `system_message`
- General/coaching: `gpt-realtime-translate` — $0.034/min, predictable cost

**Vietnamese-specific VAD:**
- `enable_aivad: true` in `advanced_features` — AI VAD for Vietnamese (semantic_vad does not support VI)
- SAL (Selective Attention Locking) via `sal` parameter — locks onto registered speaker, filters background crew
- VAD threshold: 0.75, silence_duration: 800ms — tuned for container port noise profile

**Bidirectional two-agent:**
- Agent A: `remoteUids: [supervisor_uid]` — outputs Vietnamese
- Agent B: `remoteUids: [worker_uid]` — outputs English
- One UID per agent constraint confirmed — validates 1:1 worker/supervisor design

**Runtime glossary update:**
- `POST /update` — modifies `system_message` mid-session — no verbal side-effect
- 200 maritime terms pre-loaded at session start

---

### SLIDE 07 — THE SOLANA LAYER (Technical Deep Dive)

**Duration:** 25 seconds
**Purpose:** Prove Solana expertise. Show you understand the design decisions.

**Content:**

**Why not store raw transcript on-chain?**
- Cost-prohibitive for full JSON
- Privacy risk (Vietnamese maritime operations have data sovereignty concerns)

**What goes on-chain:**
- SHA-256 hash of bilingual transcript (vi_texts + en_texts + session_id + timestamps)
- Off-chain URI pointing to full JSON (IPFS or backend storage)
- Both stored as Attributes in Metaplex Core AssetV1

**Why Soulbound NFT:**
- `PermanentFreezeDelegate` — non-transferable, locked to worker identity
- Authority (backend custodial wallet) can update Attributes for new sessions
- One NFT per worker = persistent safety compliance record

**Alpenglow readiness:**
- Currently Solana Devnet — async receipt creation
- Alpenglow clears main testnet June 2026, Q3 mainnet target
- Under 150ms finality — no code changes needed when it activates

**Zero wallet friction:**
- Backend custodial wallet signs all transactions
- Worker receives Solana Explorer link in session summary
- No Phantom, no browser extension, no crypto knowledge required

---

### SLIDE 08 — LIVE DEMO

**Duration:** 90 seconds
**Purpose:** The most important section. Everything else supports this moment.

**Pre-slide setup:** Before advancing to this slide, have:
- Phone already open on app, earphone already paired
- Teammate standing by with their phone as "supervisor"

**On-screen text (simple, dark background):**
"Live. No edits. No recording."

**Demo flow (from Section 11.1 of the architecture doc):**

| Time | Action |
|---|---|
| 0:00 | Show app on phone — QR code visible |
| 0:10 | Tap Start — show live status activate |
| 0:20 | Speak Vietnamese: "Xin chào, chúng ta có container số 3 cần kiểm tra" |
| 0:45 | Show English translation appears on screen + plays in earphone |
| 0:60 | Teammate replies English: "Let's check container number 3" |
| 1:15 | Show Vietnamese translation arrives |
| 1:30 | Tap End Session — show Solana receipt hash appear on screen |

**Backup plan if live demo fails:** Pre-recorded 60-second screen recording video ready to play. Announce honestly: "The live demo had a connectivity issue — here is a recording from our test run this morning."

---

### SLIDE 09 — TECHNICAL ACHIEVEMENTS

**Duration:** 20 seconds
**Purpose:** Quantify what was built. Make the 9 days credible.

**Content (checklist style):**

Built in 9 days — June 18–27, 2026:

- Real-time bidirectional Vietnamese/English translation under 1.5 seconds end-to-end
- Two-agent architecture with per-direction routing — remoteUids constraint correctly implemented
- Agora RTT + Translation Beta — bilingual text stream integrated and stored
- VAD tuned for 90 dB port environments — SAL + enable_aivad active
- 4 mobile reliability guards: Wake Lock, AudioContext recovery, connection-state-change handler, HFP constraint injection
- Metaplex Core Soulbound NFT — SHA-256 hash committed on Solana Devnet
- Custodial backend wallet — zero friction for end user
- Mobile-responsive web PWA — no install required — QR code to production URL

**Visual:** Clean checklist. Green checkmarks. Each item is one line.

---

### SLIDE 10 — MARKET OPPORTUNITY

**Duration:** 25 seconds
**Purpose:** Show this is bigger than a hackathon project. Give judges a reason to care about scale.

**Content:**

**Da Nang port — immediate market:**
- 16.77 million tonnes cargo target 2026 (9% YoY growth)
- Lien Chieu deep-sea port construction started Q1 2026 — first berths Q4 2028
- COSCO added new Korean/Chinese routes to Da Nang 2025 — 3 new language pairs needed
- East-West Economic Corridor: Vietnam — Laos — Thailand — Myanmar

**Accessibility market:**
- 466 million people worldwide with disabling hearing loss (WHO, 2023)
- Bone-conduction + real-time AI translation = first viable hands-free multilingual accessibility tool

**Industrial AI translation — global:**
- Manufacturing, logistics, construction, maritime — all face identical language+noise problem
- SOLAS maritime compliance documentation requirements create immediate regulatory demand for audit trails

**Monetization path:**
- $0.10/minute per active translation session (Agora CAI cost pass-through + margin)
- Enterprise contracts per port, per factory, per construction site
- Solana-anchored compliance records as a standalone SaaS product for maritime insurers

---

### SLIDE 11 — WHAT COMES NEXT

**Duration:** 15 seconds
**Purpose:** Show you are thinking beyond the hackathon. Gives judges confidence in the team's vision.

**Content:**

**Immediate (July 2026):**
- Field testing at Da Nang Port with real dock workers
- VAD threshold calibration with actual 90–110 dB ambient data
- HTTPS deployment on Vercel for iOS Safari microphone access (requires SSL)

**Medium term (Q3 2026):**
- Android native app (audio profile control, forced HFP, AUDIO_SCENARIO_AI_CLIENT)
- Agora Convo AI Device Kit R1 (Beta) — dual-mic, LTE, hardware-level noise suppression
- Solana Alpenglow mainnet — sub-150ms receipt finality
- Multi-language expansion: Japanese, Laotian, Thai (East-West Economic Corridor)

**Long term:**
- Solana Safety Pass as a portable compliance credential across ports and employers
- Maritime insurer integration — automatic incident documentation

---

### SLIDE 12 — TEAM + ASK

**Duration:** 20 seconds
**Purpose:** Close strong. Make a specific ask.

**Team:**
PiX.lab — Da Nang University of Technology
[Fill in team member names and roles]

**What we built in 9 days:**
A working, hardware-tested AI translation system — two languages, two populations, one platform.

**Our ask:**
- Access to Agora Convo AI Device Kit R1 for field hardware testing
- Introductions to Da Nang Port Authority for pilot partnership discussions
- Mentorship on WebRTC-to-Solana cryptographic provenance (our current unsolved challenge)

**Closing line (say this, do not put it on the slide):**
> "WaveLens Lite. For the workers who cannot stop to translate. For the people the world forgot to build for."

---

## DESIGN SYSTEM FOR SLIDES

### Colors
- Background: Dark navy `#0a0e1a`
- Primary accent: Agora orange `#FF6B35`
- Secondary accent: Solana purple `#9B59B6`
- Success / live: Green `#00FF9D`
- Text primary: White `#FFFFFF`
- Text secondary: Light grey `#B0B8C8`

### Typography
- Headline: Bold, large (48–64pt)
- Body: Regular, 18–22pt
- Monospace for code/hashes: Fira Code or JetBrains Mono
- Font family: Inter or Outfit (Google Fonts)

### Slide template rules
- Maximum 3 key points per slide
- No bullet lists longer than 4 items
- Every slide has one visual (image, diagram, or table)
- Never use clip art or generic icons
- Architecture diagram slides: use the actual mermaid diagrams from the PDF report

---

## TIMING BREAKDOWN

| Slide | Topic | Duration |
|---|---|---|
| 01 | Title Hook | 15s |
| 02 | The Problem | 40s |
| 03 | Why Everything Else Fails | 20s |
| 04 | Solution in One Sentence | 10s |
| 05 | How It Works | 45s |
| 06 | Agora CAI Stack | 30s |
| 07 | Solana Layer | 25s |
| 08 | Live Demo | 90s |
| 09 | Technical Achievements | 20s |
| 10 | Market Opportunity | 25s |
| 11 | What Comes Next | 15s |
| 12 | Team + Ask | 20s |
| **TOTAL** | | **5 min 35 sec** |

---

## Q&A PREPARATION — Expected Judge Questions

**Q: Why not a native app?**
A: Zero install friction. A worker opens a URL. For a hackathon demo, a QR code beats an APK installation every time. For production, we are already designing the native Android path and the Agora Device Kit R1 removes the phone entirely.

**Q: What about audio quality through Bluetooth HFP?**
A: We apply AEC, ANS, and AGC at the browser level before the audio leaves the device. This is the correct approach for the Web SDK — you do not control the Bluetooth profile from a browser, but you do control what you send. The gpt-realtime-2 model handles the rest through its own noise suppression layer.

**Q: Can you actually prove the Solana record is authentic?**
A: This is our current unsolved challenge and we are honest about it. The NFT proves when the data was saved. It does not cryptographically prove it came from Agora's LLM specifically. This is the Oracle Problem for AI provenance — zkML is too slow for real-time, TEE bridges are not yet standardized. We have raised this as our mentorship question.

**Q: What is the latency?**
A: End-to-end voice-to-translated-voice latency is approximately 1.2–1.8 seconds in our testing on a local network. The main components are: WebRTC encode/transmit (~100ms), Agora SDRTN routing (~50ms), LLM inference (~600–900ms), TTS synthesis (~150ms), and Agora→client playback (~100ms).

**Q: How does this help deaf users specifically?**
A: Two channels simultaneously. Voice channel delivers translated speech as bone-conduction vibration — this physically bypasses damaged cochlear hair cells. Text channel delivers the same content as real-time visual subtitles on screen. A profoundly deaf user who cannot use audio at all can still follow a multilingual conversation through the subtitle stream alone.
