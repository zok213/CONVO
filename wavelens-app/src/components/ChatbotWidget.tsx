"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Headphones } from "lucide-react";

interface Message {
  role: "bot" | "user";
  text: string;
}

const quickReplies = [
  "Demo hoạt động thế nào?",
  "Kiến trúc Agora & Solana",
  "Thiết bị tương thích",
  "Liên hệ nhóm",
];

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("demo") || lower.includes("hoạt động"))
    return "WaveLens Lite dùng Agora CAI Engine v2.6 để dịch giọng nói tiếng Việt → tiếng Anh trong thời gian thực. Nhấn 'Try the Demo' ở đầu trang để thử ngay!";
  if (lower.includes("agora") || lower.includes("solana") || lower.includes("kiến trúc"))
    return "Chúng tôi dùng Agora CAI Engine cho voice translation, Agora RTT cho bilingual text, và Solana để lưu SHA-256 audit hash. Xem phần 'Technology' để biết thêm.";
  if (lower.includes("thiết bị") || lower.includes("compatible") || lower.includes("hardware") || lower.includes("tương thích"))
    return "WaveLens Lite tương thích với tai nghe bone-conduction open-ear và Android phone. Production path dùng Agora Convo AI Device Kit R1.";
  if (lower.includes("liên hệ") || lower.includes("contact") || lower.includes("nhóm"))
    return "Nhóm WaveLens Lite đang tham dự Agora × Solana Convo AI Hackathon tại ĐH Bách Khoa Đà Nẵng, ngày 28/6/2026. Email: wavelens@hackathon.vn";
  return "Cảm ơn bạn đã liên hệ! Nhóm WaveLens Lite sẽ phản hồi sớm. Trong lúc đó, bạn có thể thử demo hoặc xem phần Technology để hiểu thêm về sản phẩm.";
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

function BotMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[80%] bg-white border border-gray-200 rounded-[12px_12px_12px_4px] px-3.5 py-2.5 text-sm text-gray-900 leading-relaxed">
        {text}
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end mb-3">
      <div className="max-w-[80%] bg-[#FF6B35] text-white rounded-[12px_12px_4px_12px] px-3.5 py-2.5 text-sm leading-relaxed">
        {text}
      </div>
    </div>
  );
}

function QuickReply({ text, onClick }: { text: string; onClick: (t: string) => void }) {
  return (
    <button
      onClick={() => onClick(text)}
      className="shrink-0 border border-[#FF6B35] text-[#FF6B35] bg-white rounded-full px-3.5 py-1.5 text-xs font-medium hover:bg-[#FF6B35] hover:text-white transition-colors min-h-[36px]"
    >
      {text}
    </button>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Notification badge — hide after 3s or when chat opens
  useEffect(() => {
    const timer = setTimeout(() => setShowBadge(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) setShowBadge(false);
  }, [isOpen]);

  // Initial bot messages on open
  useEffect(() => {
    if (!isOpen) return;
    const msgs = [
      { role: "bot" as const, text: "👋 Xin chào! Tôi là trợ lý WaveLens Lite." },
      { role: "bot" as const, text: "Bạn muốn tìm hiểu về tính năng nào?" },
    ];
    let idx = 0;
    setIsTyping(true);
    const interval = setInterval(() => {
      if (idx < msgs.length) {
        setMessages((prev) => [...prev, msgs[idx]]);
        idx++;
        if (idx === msgs.length) setIsTyping(false);
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-focus input on desktop
  useEffect(() => {
    if (isOpen && window.innerWidth >= 768) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: getBotResponse(text) }]);
      setIsTyping(false);
    }, 800);
  }, []);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    addUserMessage(text);
  }, [inputValue, addUserMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FF6B35] text-white flex items-center justify-center shadow-lg hover:scale-108 hover:bg-[#e85d2a] transition-all duration-150 ease-out"
        aria-label={isOpen ? "Close WaveLens support chat" : "Open WaveLens support chat"}
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
        {/* Notification badge */}
        {showBadge && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
        )}
      </button>

      {/* Chat popup */}
      {isOpen && (
        <div
          className="fixed z-[9998] bottom-[68px] right-4 sm:bottom-[86px] sm:right-6 w-[calc(100vw-32px)] sm:w-[360px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] flex flex-col animate-[slideUpFade_200ms_ease-out] origin-bottom-right"
          style={{
            height: typeof window !== "undefined" && window.innerHeight < 600 ? "calc(100vh - 120px)" : "480px",
          }}
        >
          {/* Header */}
          <div className="h-14 bg-[#FF6B35] rounded-t-2xl flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold leading-tight">WaveLens Support</div>
                <div className="text-white/80 text-xs leading-tight">Typically replies instantly</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/90 hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-[#F8F9FA] px-4 py-3">
            {messages.filter((msg) => msg && msg.role).map((msg, i) =>
              msg.role === "bot" ? <BotMessage key={i} text={msg.text} /> : <UserMessage key={i} text={msg.text} />
            )}
            {isTyping && <TypingDots />}
            {/* Quick replies — shown after initial bot messages */}
            {messages.length === 2 && !isTyping && (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {quickReplies.map((qr) => (
                  <QuickReply key={qr} text={qr} onClick={addUserMessage} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="h-14 border-t border-gray-200 bg-white rounded-b-2xl flex items-center shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              className="flex-1 h-full bg-transparent border-none outline-none text-sm px-3 placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              className="w-9 h-9 rounded-full bg-[#FF6B35] text-white flex items-center justify-center mr-2.5 shrink-0 hover:bg-[#e85d2a] transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-up animation keyframes */}
      <style jsx global>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
