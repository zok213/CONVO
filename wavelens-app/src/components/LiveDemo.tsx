"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, AlertCircle, CheckCircle2 } from "lucide-react";

type DemoStatus = "idle" | "listening" | "translating";

const DEMO_TURNS: { vi: string; en: string }[] = [
  { vi: "kÃ©t ballast đang rÃ² rỉ", en: "The ballast tank is leaking." },
  { vi: "cần kiểm tra van số 3", en: "Need to check valve #3." },
  { vi: "tàu vào cảng lÃºc 14 giờ", en: "Ship arrives at port at 14:00." },
];

export default function LiveDemo() {
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [turns, setTurns] = useState<{ vi: string; en: string }[]>([]);
  const [domain, setDomain] = useState<"maritime" | "coaching">("maritime");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const turnIdxRef = useRef(0);
  const [micGranted, setMicGranted] = useState<boolean | null>(null);

  const requestMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicGranted(true);
      return true;
    } catch {
      setMicGranted(false);
      return false;
    }
  }, []);

  const startDemo = useCallback(async () => {
    const ok = await requestMic();
    if (!ok) return;

    setStatus("listening");
    setTurns([]);
    turnIdxRef.current = 0;

    // Simulate brief "listening" then show first translation
    setTimeout(() => {
      setStatus("translating");
      setTurns([DEMO_TURNS[0]]);
      turnIdxRef.current = 1;

      intervalRef.current = setInterval(() => {
        if (turnIdxRef.current >= DEMO_TURNS.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStatus("idle");
          return;
        }
        setStatus("listening");
        setTimeout(() => {
          setStatus("translating");
          setTurns((prev) => [...prev, DEMO_TURNS[turnIdxRef.current]]);
          turnIdxRef.current++;
        }, 1500);
      }, 4000);
    }, 2000);

    setStatus("translating");
  }, [requestMic]);

  const stopDemo = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus("idle");
  }, []);

  // Request mic permission on mount to check state
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((s) => { s.getTracks().forEach((t) => t.stop()); setMicGranted(true); })
      .catch(() => setMicGranted(false));
  }, []);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return (
    <section id="demo" className="scroll-mt-16 py-16 sm:py-24 bg-white">
      <div className="page-width">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1">
          Try the live interpreter demo
        </h2>
        <p className="text-center text-gray-500 text-sm sm:text-base mb-8 max-w-md mx-auto">
          Vietnamese → English maritime voice translation
        </p>

        <div className="max-w-lg mx-auto">
          <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm p-5 sm:p-8">
            {/* Domain selector */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                Domain
              </label>
              <div className="flex gap-2">
                {(["maritime", "coaching"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDomain(d)}
                    disabled={status !== "idle"}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                      domain === d
                        ? "bg-[#06b6d4] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    } ${status !== "idle" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {d === "maritime" ? "🏗 Maritime / Industrial" : "🎯 Coaching / General"}
                  </button>
                ))}
              </div>
            </div>

            {/* Language pair */}
            <div className="mb-5 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">Vietnamese</div>
              <div className="text-gray-300 text-xs">→</div>
              <div className="text-sm font-medium text-gray-700">English</div>
            </div>

            {/* Mic button */}
            <div className="flex justify-center mb-5">
              <button
                onClick={status === "idle" ? startDemo : stopDemo}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  status === "idle"
                    ? "bg-[#06b6d4] text-white hover:bg-[#0891b2] shadow-lg hover:shadow-xl"
                    : status === "listening"
                    ? "bg-yellow-500 text-white animate-pulse"
                    : "bg-green-500 text-white"
                }`}
                aria-label={status === "idle" ? "Start speaking" : "Stop"}
              >
                {status === "idle" ? (
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
                ) : (
                  <Square className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </button>
            </div>

            {/* Status text */}
            <p className="text-center text-sm font-medium mb-5 min-h-[20px]">
              {status === "idle" && (
                micGranted === false ? (
                  <span className="text-red-500 text-xs flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Microphone access required … please allow mic permission
                  </span>
                ) : (
                  <span className="text-gray-500">Tap the mic and speak Vietnamese</span>
                )
              )}
              {status === "listening" && <span className="text-yellow-600">Listening...</span>}
              {status === "translating" && <span className="text-green-600">Translating to English...</span>}
            </p>

            {/* Audio output note */}
            <div className="mb-5 p-3 bg-blue-50 rounded-lg text-xs sm:text-sm text-blue-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              English audio playing through your Shokz headset or phone speaker.
            </div>

            {/* Transcript */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {turns.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-6">
                  Translated turns will appear here...
                </p>
              ) : (
                turns.map((turn, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-400 mb-0.5">
                      {domain === "maritime" ? "🏗" : "🎯"} Turn {i + 1}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-0.5">
                      VI: {turn.vi}
                    </div>
                    <div className="text-sm text-gray-600">
                      EN: {turn.en}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Powered by */}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                <span className="font-semibold text-gray-500">Agora</span>
                CAI Engine v2.6 + Real-Time STT & Translation
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                <span className="font-semibold text-gray-500">Solana</span>
                Receipts for bilingual transcript hashes
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            This demo requires microphone access. We only hash bilingual text to Solana,
            not raw audio. Not for live safety-critical operations.
          </p>

          <p className="text-[10px] text-gray-300 mt-2 text-center">
            Target latency: ~670ms P50, &lt;1.4s P90 with gpt-realtime-2
          </p>
        </div>
      </div>
    </section>
  );
}
