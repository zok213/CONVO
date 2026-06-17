import { Ear, VolumeX, Languages, Headphones, Waves, Shield } from "lucide-react";

const problems = [
  {
    icon: Ear,
    title: "Noise & hands-free",
    desc: "Ports and ship engine rooms run at 85–110 dB. Workers need both hands on cranes, tools, or valves.",
  },
  {
    icon: Shield,
    title: "Water & safety",
    desc: "Rain, salt spray, and steam make phones impractical. In-ear headsets block alarms and ambient safety cues.",
  },
  {
    icon: Languages,
    title: "Language gaps",
    desc: "Vietnamese crews work with English, Korean, and Chinese officers. Walkie-talkies don't translate, and hand signals don't scale.",
  },
];

export default function ProblemSolution() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="page-width">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          Why phones and in-ear headsets fail in ports and engine rooms
        </h2>
        <p className="text-center text-gray-500 mb-10 sm:mb-12 max-w-xl mx-auto">
          The reality of industrial maritime communication
        </p>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {problems.map((p) => (
            <div key={p.title} className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-3">
                <p.icon className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 capitalize">{p.title}</h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Solution block */}
        <div className="bg-[#0c1a2d] rounded-xl sm:rounded-2xl p-6 sm:p-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Headphones className="w-6 h-6 text-[#06b6d4]" />
            <h3 className="text-xl sm:text-2xl font-bold">
              Our solution: keep ears open, translate through bone conduction.
            </h3>
          </div>
          <ul className="space-y-3 sm:space-y-4">
            {[
              "Vietnamese speech captured on phone or Android device.",
              "Agora CAI Engine performs low-latency voice translation.",
              "English audio plays through Shokz bone-conduction headsets, while bilingual text is hashed to Solana for audit.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-gray-300">
                <Waves className="w-4 h-4 text-[#06b6d4] mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
