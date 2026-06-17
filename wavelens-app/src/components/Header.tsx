"use client";

import { useState, useEffect } from "react";
import { Search, User, Menu, X } from "lucide-react";

const menuItems = [
  { label: "Products", href: "#product-collection" },
  { label: "Technology", href: "#technology" },
  { label: "Support", href: "#faq" },
  { label: "About", href: "#about" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white border-b border-gray-100 shadow-sm"
          : "bg-black/20 backdrop-blur-sm"
      }`}
    >
      <header className="page-width flex items-center justify-between h-[60px] md:h-[68px]">
        <button
          className={`lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 ${
            scrolled ? "text-gray-700" : "text-white/90"
          }`}
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a href="/" className="flex items-center mx-auto lg:mx-0">
          <span
            className={`text-base md:text-lg font-bold transition-colors duration-300 ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            WaveLens Lite
          </span>
        </a>

        <nav className="hidden lg:flex items-center">
          <ul className="flex list-none m-0 p-0 gap-8 xl:gap-12">
            {menuItems.map((item) => (
              <li key={item.label} className="flex items-center h-[68px]">
                <a
                  href={item.href}
                  className={`text-sm xl:text-base no-underline transition-colors duration-300 ${
                    scrolled
                      ? "text-gray-600 hover:text-[#ff7d3d]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <a
            href="/demo"
            className="hidden sm:inline-flex text-sm font-semibold text-white bg-[#ff7a3d] px-4 py-2 rounded hover:bg-[#ff5a1a] transition-colors no-underline min-h-[44px] items-center"
          >
            Live Demo
          </a>
          <button
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-300 ${
              scrolled ? "text-gray-600" : "text-white/80"
            }`}
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px] md:w-5 md:h-5" />
          </button>
          <a
            href="/account"
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-300 ${
              scrolled ? "text-gray-600" : "text-white/80"
            }`}
            aria-label="Account"
          >
            <User className="w-[18px] h-[18px] md:w-5 md:h-5" />
          </a>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-white overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white/95 backdrop-blur flex items-center justify-between px-4 py-3 border-b z-10">
              <span className="font-medium text-sm">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3.5 px-3 text-sm font-medium rounded-lg hover:bg-gray-50 min-h-[44px] flex items-center no-underline text-gray-900"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/demo"
                onClick={() => setMobileOpen(false)}
                className="block py-3 px-3 mt-2 text-sm font-semibold text-white bg-[#ff7a3d] rounded-lg text-center no-underline"
              >
                Live Demo
              </a>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
