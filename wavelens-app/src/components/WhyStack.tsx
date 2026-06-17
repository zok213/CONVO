import { Cpu, Coins, Headphones } from "lucide-react";

const cards = [
  {
    icon: Cpu,
    title: "Why Agora",
    color: "text-[#06b6d4]",
    bgColor: "bg-[#06b6d4]/10",
    bullets: [
      "CAI Engine v2.6 for low-latency voice translation with VAD, AEC, and 95% noise suppression.",
      "SDRTN network tolerates up to 80% packet loss in harsh network environments.",
      "Real-Time STT + Translation Beta produces clean bilingual text for audit.",
    ],
  },
  {
    icon: Coins,
    title: "Why Solana",
    color: "text-[#f59e0b]",
    bgColor: "bg-amber-50",
    bullets: [
      "Immutable bilingual transcript receipts via Solana PDA (SHA-256 hash of VI + EN).",
      "x402 USDC micropayments enable per-session billing without heavy web2 billing infrastructure.",
      "Auditors can verify safety drill evidence without accessing raw crew audio.",
    ],
  },
  {
    icon: Headphones,
    title: "Why Shokz",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    bullets: [
      "Bone-conduction headsets keep ears open for alarms and environment.",
      "IP-rated hardware suitable for rain, spray, and sweat.",
      "Existing Shokz devices serve as demo hardware today; Agora Convo AI Device Kit R1 is the production path.",
    ],
  },
];

export default function WhyStack() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="page-width">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          Why we chose these building blocks
        </h2>
        <p className="text-center text-gray-500 text-sm sm:text-base mb-10 sm:mb-12 max-w-lg mx-auto">
          Purpose-built for industrial voice translation.
        </p>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((card) => (
            <div key={card.title} className="rounded-xl border border-gray-100 p-5 sm:p-6">
              <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center mb-4`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-3">{card.title}</h3>
              <ul className="space-y-2.5">
                {card.bullets.map((b, i) => (
                  <li key={i} className="text-sm sm:text-base text-gray-600 leading-relaxed flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${card.color} mt-2 shrink-0`} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
