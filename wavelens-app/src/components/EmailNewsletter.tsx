export default function EmailNewsletter() {
  return (
    <section id="faq" className="scroll-mt-16 py-12 sm:py-16 md:py-20 bg-[#F3F4F6]">
      <div className="page-width">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-heading text-center mb-2">
            FAQ / Support
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-500 mb-8">
            Common questions about the WaveLens Lite MVP.
          </p>

          <div className="space-y-3">
            {[
              {
                q: "Is WaveLens Lite a production-ready product?",
                a: "No. It is a hackathon MVP and should not be used for live safety-critical operations yet. See the disclaimer in the footer.",
              },
              {
                q: "Which languages are supported today?",
                a: "The hackathon demo supports Vietnamese → English. Korean and Chinese are in the planned roadmap.",
              },
              {
                q: "Which hardware is supported?",
                a: "We currently test on Android phones plus Shokz headsets (OpenRun Pro 2, OpenComm2 UC). The production path targets Agora Convo AI Device Kit R1.",
              },
              {
                q: "How is the audio translated?",
                a: "Vietnamese audio is captured by the phone mic and streamed via Agora SDRTN to the CAI Engine v2.6, which performs VAD, noise suppression, and AI translation. English audio plays back through the Shokz headset.",
              },
              {
                q: "What data is stored on Solana?",
                a: "Only SHA-256 hashes of bilingual (VI + EN) transcript text. No raw audio, no PII. The hash can be verified on Solana devnet without exposing the original conversation.",
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-lg border border-gray-200 group">
                <summary className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 cursor-pointer min-h-[44px] text-sm sm:text-base font-medium text-gray-900 list-none">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-400 shrink-0 ml-2 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-4 sm:px-5 pb-3.5 sm:pb-4 text-sm sm:text-base text-gray-500 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
