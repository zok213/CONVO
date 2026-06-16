**WaveLens Lite**

**Bone-Conduction Conversational Interpreter using Agora & Solana**

**0\. Executive Summary**

WaveLens Lite là một hệ thống **Conversational AI Interpreter** giúp công nhân logistics, thuỷ thủ, và vận động viên giao tiếp xuyên ngôn ngữ trong môi trường:

* Ồn ào (cảng biển, nhà kho, boong tàu).

* Hands‑busy (lái xe nâng, thao tác thiết bị, bơi).

* Gần nước hoặc trong mưa.

Người dùng nói tiếng Việt, hệ thống sử dụng **Agora** để stream audio real‑time tới backend AI, gọi **API dịch (STT/MT/TTS)**, rồi trả lại audio đã dịch tới **tai nghe truyền xương chống nước**. Tai nghe open‑ear cho phép người dùng vừa nghe bản dịch vừa nghe âm thanh môi trường, đảm bảo an toàn.

Để đáp ứng yêu cầu giải kép, dự án tích hợp **Solana**:

* Ghi **on‑chain receipts** cho các phiên dịch quan trọng (hash transcript).

* Thực hiện **micropayment** theo mức sử dụng cho dịch vụ AI.

Dự án bám sát chủ đề hackathon: ứng dụng Agora để build conversational AI/AI agents, real-time interaction, và voice communication có tính ứng dụng thực tế

**1\. Problem Statement & Use Cases**

**1.1. Pain points thực tế**

Các môi trường logistic/biển/thể thao có các đặc điểm:

* **Tiếng ồn cao**: máy móc, còi tàu, loa phát thanh.

* **Tay bận**: người vận hành không thể liên tục cầm điện thoại hoặc nhìn màn hình.

* **Môi trường khắc nghiệt**: mưa, hơi nước, nước biển, rung lắc.

* **Đa ngôn ngữ**:

  * Worker Việt Nam ↔ Supervisor/Officer EN/ZH/KO.

  * Học sinh/VĐV cần coach tiếng Anh.

Các công cụ dịch hiện tại (app trên điện thoại) không phù hợp:

* Phụ thuộc mạng, không tối ưu cho hands‑busy.

* Yêu cầu nhìn màn hình, nghe qua in‑ear không chống nước.

* Không hỗ trợ scenario group (broadcast cho nhiều worker).

**1.2. Use cases cụ thể**

1. **Cảng biển / bãi container (VI ↔ EN/ZH)**

   * Worker vận hành xe nâng, crane; supervisor nước ngoài đưa lệnh bằng tiếng Anh/Trung.

   * Worker đeo tai nghe truyền xương, nghe bản dịch và vẫn nghe còi tàu, tín hiệu an toàn.

2. **Boong tàu & engine room (VI ↔ EN/ZH/KO)**

   * Crew Việt \+ officer Hàn/Anh/Trung phối hợp trong safety drill, manoeuvring, maintenance.

   * Lệnh được dịch 2 chiều, session quan trọng có thể được hash và ghi lên Solana để audit.

3. **Swimming & sports coaching (VI ↔ EN)**

   * VĐV (kể cả nghe kém) đeo tai nghe truyền xương chống nước.

   * Coach nói tiếng Anh; agent dịch/giải thích bằng tiếng Việt hoặc ngược lại.

**2\. High-Level Architecture**

**2.1. Thành phần chính**

1. **Client Application (Android / Web)**

   * Tích hợp **Agora Real-Time Voice SDK** để:

     * Join/leaving channels.

     * Capture microphone input.

     * Play back audio từ AI agent.

   * Quản lý routing âm thanh tới **tai nghe truyền xương Bluetooth** (dựa trên device audio routing)

2. **Agora Conversational AI Engine**

   * Hạ tầng **Conversational AI** của Agora:

     * Streaming audio pipeline với noise suppression, VAD, AEC.

     * STT front‑end \+ integration với LLM/TTS để tạo Voice Agents low latency.

   * Cấu hình để gửi transcript & metadata về backend của team (webhook).

3. **AI Orchestration Backend**

   * Service (FastAPI/Express) triển khai:

     * Nhận transcript tiếng Việt và metadata từ Agora.

     * Gọi STT (nếu cần), MT, LLM, TTS thông qua các API third‑party.

     * Trả lại response (text/audio) cho Agora engine.

   * Business logic:

     * Quản lý target language (EN/ZH/KO).

     * Domain logic (factory / ship / swim).

     * Logging & analytics.

4. **Solana Integration Layer**

   * **Smart contract (Solana program)** hỗ trợ:

     * On‑chain receipts: lưu hash của transcript \+ metadata.

     * Usage-based payments: charge stablecoin theo số phút/lượt sử dụng.

   * Off-chain adapter:

     * Kết nối backend với Solana RPC, quản lý ví & giao dịch.

5. **Bone-Conduction Headset**

   * Tai nghe open‑ear, Bluetooth, chống nước (IPX5–IPX8).

   * Nhận audio đã dịch từ app; người dùng lưu ý không bịt tai → nghe được còi/báo hiệu.

**3\. End-to-End Interaction Flow**

**3.1. Setup & session start**

1. **Đăng nhập & pair thiết bị**

   * Người dùng đăng nhập vào app (account \+ optional Solana wallet).

   * App kiểm tra & thiết lập kết nối Bluetooth với tai nghe truyền xương.

2. **Join Agora channel & start agent**

   * App gọi Agora SDK để join một channel dành riêng cho session.

   * App khởi tạo một **Conversational AI agent instance** trên Agora engine, với cấu hình:

     * Source language: Vietnamese (vi-VN).

     * Target language: EN / ZH / KO.

     * Mode: translator / assistant.

**3.2. Conversational loop (one turn)**

1. User nói tiếng Việt → mic (on device) → audio frame streaming qua Agora SDK lên Conversational AI Engine

2. Engine:

   * Áp dụng noise suppression, VAD, AEC để cải thiện tín hiệu trong môi trường ồn.

   * Chạy STT (built‑in hoặc plugin) để chuyển audio → transcript tiếng Việt.

   * Trigger webhook tới backend với payload:

     * session\_id, user\_id, lang\_src=vi, lang\_tgt=en/zh/ko,

     * transcript\_vi, timestamp, context ID.

3. Backend:

   * **Translation/LLM**:

     * Gọi API MT/LLM (OpenAI/SeamlessM4T/NeMo).

     * Nhận translated\_text ở ngôn ngữ đích.

   * **TTS**:

     * Gọi TTS API để synthesize translated\_text → audio\_tgt (EN/ZH/KO voice).

   * Optional: nếu agent cần nói nhiều hơn (giải thích, HD), LLM có thể generate câu mới.

4. Engine nhận audio\_tgt từ backend:

   * Inject audio vào audio stream của channel.

5. Client app:

   * Nhận audio từ Agora.

   * OS route audio tới tai nghe truyền xương → user nghe bản dịch.

6. Lặp lại cho mỗi lượt nói; engine xử lý barge‑in (người dùng có thể ngắt câu trước, nói tiếp).

**3.3. Session end**

1. User hoặc supervisor bấm “End Session” trên app.

2. Backend:

   * Tổng kết usage (t/gian, số lượt request, ngôn ngữ).

   * Gửi dữ liệu tới Solana service để:

     * Tạo **receipt hash**,

     * Thực hiện micropayment (nếu bật).

3. Agent & channel được đóng, tài nguyên được giải phóng

**4\. AI Backend Design**

**4.1. API modules**

* POST /webhook/agora

  * Input: JSON payload từ Agora (transcript, metadata).

  * Steps:

    1. Validate & auth.

    2. Determine lang\_target & mode.

    3. Call translation/LLM/TTS.

    4. Return audio buffer or URL cho Agora engine.

* POST /session/start

  * Khởi tạo session metadata, tạo session\_id, set config (lang, domain).

* POST /session/end

  * Ghi log usage, call Solana service to write receipt & process payment.

**4.2. Translation & TTS options**

**Translation**:

* Option 1: OpenAI Realtime / GPT‑4o mini (good enough for VI↔EN/ZH/KO).

* Option 2: SeamlessM4T v2 (Meta) với mode text→text.

* Option 3: NVIDIA NeMo MT (nếu có sẵn service).

**TTS**:

* Provider TTS with languages EN/ZH/KO; chọn voice “clear, neutral, mid‑speed” để nghe tốt trên bone‑conduction.

**4.3. Domain handling**

* Mỗi session có domain (factory, port, ship, swim).

* Backend có prompt/config riêng:

  * Bổ sung glossary, ví dụ:

    * “ballast tank” → giữ nguyên;

    * “gantry crane” → dịch thống nhất;

    * “lane X ready” trong swimming.

* Giới hạn context:

  * Tự động cắt bớt history để giảm chi phí LLM.

**5\. Solana Integration Design**

**5.1. On-chain receipts**

**Mục tiêu**:  
Tạo “chứng từ” cho các phiên dịch quan trọng mà không lộ nội dung.

**Data model (off-chain)**:

* session\_id

* user\_id (pseudonymized)

* lang\_pair

* domain

* transcript

* timestamp\_start, timestamp\_end

**On-chain struct**:

struct Receipt {  
    session\_id: \[u8; 16\],  
    hash: \[u8; 32\],        // SHA-256 của serialized transcript \+ meta  
    timestamp: i64,  
    usage\_cost: u64,       // số lamports hoặc số lượng của stablecoin  
}

**Flow**:

1. Khi kết thúc session:

   * Backend serialize \[transcript, meta\].

   * Tính hash \= SHA256(serialized).

2. Gọi Solana program create\_receipt(session\_id, hash, timestamp, cost).

3. Lưu transcript ở DB off‑chain.

4. Khi audit:

   * Lấy transcript, tính lại hash;

   * So sánh với on‑chain hash → verify integrity.

**5.2. Usage-based micropayments**

**Mục tiêu**:  
Thu phí dựa trên usage (per minute/per request) bằng stablecoin trên Solana.

**Data model on-chain**:

struct AccountUsage {  
    owner: Pubkey,  
    allowance: u64,   // max chi tiêu (tokens)  
    spent: u64,  
}

**Flow**:

1. User nạp stablecoin vào ví & set allowance trong contract.

2. Backend theo dõi usage session (thời gian, số call).

3. Cuối session:

   * Tính fee \= f(usage);

   * Gửi transaction Solana:

     * Debit từ ví user → ví service (nội bộ).

   * Update spent.

4. Nếu spent \>= allowance:

   * Backend trả HTTP 402 (“Payment Required”) cho session sau;

   * Client hiển thị UI yêu cầu nạp thêm.

Điểm nhấn: tận dụng pattern **agentic payments** của Solana để cho thấy khả năng tự động thanh toán cho AI agents.

**6\. Non-functional Requirements**

**6.1. Latency targets**

* End‑to‑end latency:

  * Speech→translation→speech \< 800 ms cho câu ngắn.

* Component budget:

  * Agora network \+ STT: 200–300 ms.

  * MT/LLM: 100–200 ms.

  * TTS: 100–200 ms.

  * Playback \+ Bluetooth: 100–200 ms.

**6.2. Reliability & resiliency**

* Retry với backoff cho API calls.

* Fallback mode:

  * Nếu fail translation, có thể trả transcript gốc hoặc message “please repeat”.

* Logging & monitoring:

  * Structured logs (JSON) cho từng request, map với session\_id.

**6.3. Security & privacy**

* Encryption trên Agora channel.

* Token‑based auth giữa Agora → backend.

* Pseudonymization user\_id trong logs.

* On-chain chỉ lưu hash, không lưu nội dung trực tiếp.

**7\. Implementation Plan (Hackathon-Friendly)**

**Phase 1 – Core Voice Pipeline (Day 1–2)**

* Setup Agora voice call demo (Basic Audio Call) để join channel, capture mic, play audio.

* Tích hợp Conversational AI quickstart:

  * Voice agent example;

  * Custom webhook handler.

**Phase 2 – Translation & TTS (Day 3–4)**

* Implement backend webhook:

  * Nhận transcript;

  * Call MT & TTS APIs;

  * Return audio bytes.

* Thêm support VI→EN/ZH/KO:

  * UI switch;

  * Backend switch translation/TTS voice.

**Phase 3 – Bone-Conduction Integration (Day 3–4)**

* Pair test với 1–2 mẫu tai nghe bone‑conduction.

* Kiểm tra audio route → headset trong các scenario (voice call mode / live mode).

**Phase 4 – Solana MVP (Day 5–6)**

* Viết smart contract đơn giản (Anchor) cho Receipt & AccountUsage.

* Tích hợp backend:

  * RPC client → create receipt at session end.

  * Simple micropayment (transfer fixed fee per session).

**Phase 5 – Polish & Demo (Day 7\)**