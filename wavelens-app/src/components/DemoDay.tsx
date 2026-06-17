import { Beaker, BookOpen, ExternalLink, BarChart3 } from "lucide-react";

const items = [
  {
    icon: Beaker,
    title: "Hardware demo",
    desc: "We connect Shokz headset and explain bone conduction in one sentence.",
  },
  {
    icon: BookOpen,
    title: "Domain glossary",
    desc: "We select 'Maritime' domain and show the glossary in the UI.",
  },
  {
    icon: ExternalLink,
    title: "Live translation",
    desc: "We say 'kÃ©t ballast đang rÃ² rỉ' and display 'ballast tank is leaking' in the transcript.",
  },
  {
    icon: BarChart3,
    title: "Audit trail",
    desc: "We open Solana explorer and Agora dashboard to show the audit receipt and agent activity.",
  },
];

export default function DemoDay() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="page-width">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          What we will show you on Demo Day
        </h2>
        <p className="text-center text-gray-500 text-sm sm:text-base mb-8 sm:mb-10 max-w-lg mx-auto">
          A live walkthrough of the MVP.
        </p>

        <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-4 sm:gap-6">
          {items.map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-xl p-4 sm:p-5">
              <div className="w-9 h-9 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center mb-3">
                <item.icon className="w-4.5 h-4.5 text-[#06b6d4]" />
              </div>
              <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
