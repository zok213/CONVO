import { Ear, Cpu, FileText, Shield } from "lucide-react";

const benefits = [
  {
    icon: Ear,
    title: "Open-Ear Safety",
    desc: "Bone-conduction keeps both ears open for alarms, engines, and crew calls while hearing translated speech.",
  },
  {
    icon: Cpu,
    title: "Agora CAI Engine",
    desc: "Low-latency translation with VAD, AEC, and 95% noise suppression purpose-built for industrial audio.",
  },
  {
    icon: FileText,
    title: "Bilingual Transcript",
    desc: "Real-time Vietnamese and English text generated in parallel ” ready for audit and review.",
  },
  {
    icon: Shield,
    title: "Solana Receipts",
    desc: "SHA-256 hashes of every bilingual exchange stored immutably on Solana for compliance verification.",
  },
];

export default function Benefits() {
  return (
    <section className="py-16 md:py-20">
      <div className="page-width">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {benefits.map((item) => (
            <div key={item.title} className="bg-[#F3F4F6] rounded-lg p-6 text-center">
              <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center">
                <item.icon className="w-8 h-8 text-[#ff7a3d]" />
              </div>
              <h3 className="text-base font-heading mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
