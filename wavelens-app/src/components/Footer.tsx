"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const footerMenus = [
  {
    title: "Product",
    links: [
      { label: "WaveLens Demo Kit", href: "#product-collection" },
      { label: "Compatible Headsets", href: "#product-collection" },
      { label: "Pricing TBD", href: "#" },
    ],
  },
  {
    title: "Technology",
    links: [
      { label: "Agora CAI Engine", href: "#technology" },
      { label: "Solana Audit Trail", href: "#technology" },
      { label: "Architecture", href: "#technology" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Hackathon Info", href: "#about" },
      { label: "Contact Team", href: "#about" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "#about" },
      { label: "Convo AI 2026", href: "#about" },
      { label: "GitHub Repo", href: "#" },
    ],
  },
];

export default function Footer() {
  const [openMobileMenus, setOpenMobileMenus] = useState<string[]>([]);

  const toggleMobileMenu = (title: string) => {
    setOpenMobileMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <footer id="about" className="scroll-mt-16 bg-[#050505] text-white">
      <div className="page-width py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="lg:w-64 xl:w-80 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold">WaveLens Lite</span>
              <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">× Shokz</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Real-time Vietnamese-to-English voice translation for port and ship crews.
              Built for Convo AI Hackathon 2026, Đại học Bách Khoa Đà Nẵng.
            </p>
            <div className="flex gap-3">
              {["Agora", "Solana", "Shokz"].map((s) => (
                <span key={s} className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">{s}</span>
              ))}
            </div>

            <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed mt-6 pt-4 border-t border-gray-800">
              Prototype only. Not certified for live maritime safety operations. Do not use for
              real-time life safety decisions. Always maintain situational awareness in industrial environments.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {footerMenus.map((menu) => (
              <div key={menu.title}>
                <button
                  onClick={() => toggleMobileMenu(menu.title)}
                  className="flex items-center justify-between w-full text-xs sm:text-sm font-medium text-white py-2 min-h-[44px] lg:cursor-default"
                >
                  {menu.title}
                  <ChevronDown className={`w-3.5 h-3.5 lg:hidden transition-transform shrink-0 ${openMobileMenus.includes(menu.title) ? "rotate-180" : ""}`} />
                </button>
                <ul className={`space-y-2 sm:space-y-2.5 ${openMobileMenus.includes(menu.title) ? "block" : "hidden lg:block"}`}>
                  {menu.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-xs sm:text-sm text-gray-500 hover:text-white transition-colors no-underline inline-block py-1 min-h-[36px] leading-[36px]">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800 text-center text-xs sm:text-sm text-gray-600">
          WaveLens Lite ” built for Agora × Solana Convo AI Hackathon 2026, Đại học Bách Khoa Đà Nẵng.
        </div>
      </div>
    </footer>
  );
}
