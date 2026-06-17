import Image from "next/image";

const partners = [
  { name: "Agora", logo: "agora-logo.png", label: "Real-time voice AI" },
  { name: "Solana", logo: "solona-logo.png", label: "Blockchain audit" },
  { name: "Shokz", logo: "shokz-logo.png", label: "Bone-conduction audio" },
  { name: "ĐH Bách Khoa ĐN", logo: "backkhoadanang-logo.png", label: "Hackathon partner" },
  { name: "Agora CAI", logo: "agoraCAI-logo.png", label: "Conversational AI Engine" },
  { name: "Solana Devnet", logo: "solonadevnet-logo.png", label: "Testnet" },
  { name: "Tân Cảng Sài Gòn", logo: "tancangsaigon-logo.png", label: "Port operator" },
  { name: "Cảng Đà Nẵng", logo: "cangdanang-logo.png", label: "Port operator" },
  { name: "Gemadept Logistics", logo: "gemadeptlogistic-logo.png", label: "Logistics" },
  { name: "VIMC", logo: "vimc-logo.png", label: "Shipping" },
  { name: "Cảng Hải Phòng", logo: "canghaiphong-logo.png", label: "Port operator" },
  { name: "Cảng Sài Gòn", logo: "cangsaigon-logo.png", label: "Port operator" },
];

export default function CoBrand() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="page-width">
        <h2 className="text-3xl md:text-4xl font-heading text-center mb-3">
          Partners
        </h2>
        <p className="text-center text-gray-400 text-sm sm:text-base mb-10 max-w-lg mx-auto">
          Current and future collaborators in maritime translation.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="group relative bg-white rounded-xl border border-gray-100 p-4 sm:p-5 flex flex-col items-center justify-center text-center min-h-[110px] sm:min-h-[120px] shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 ease-out"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2.5 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                <img
                  src={`/images/${partner.logo}`}
                  alt={`${partner.name} logo`}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-600 leading-tight group-hover:text-gray-900 transition-colors duration-200">
                {partner.name}
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {partner.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
