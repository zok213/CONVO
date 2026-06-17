interface MemberCTAProps {
  bgImage: string;
  title?: string;
}

export default function MemberCTA({ bgImage, title }: MemberCTAProps) {
  return (
    <div className="relative w-full min-h-[40vh] sm:min-h-[50vh] flex items-center overflow-hidden">
      <img
        src={bgImage}
        alt="WaveLens Lite"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative page-width text-center text-white py-12 sm:py-20">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading mb-3 sm:mb-4 max-w-xl sm:max-w-2xl mx-auto leading-tight px-2">
          {title || "Try WaveLens Lite. Real-time Vietnamese-to-English translation for port and ship crews."}
        </h2>
        <div className="flex justify-center gap-3 sm:gap-4">
          <a href="/demo" className="btn-primary !bg-[#ff7a3d] !text-white !border-[#ff7a3d] hover:!bg-[#ff5a1a]">
            Start Live Demo
          </a>
          <a href="#technology" className="btn-outline !text-white !border-white hover:!bg-white/20">
            View Tech Stack
          </a>
        </div>
      </div>
    </div>
  );
}
