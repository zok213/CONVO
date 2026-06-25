import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "WaveLens Lite — Bone-Conduction Interpreter for Port & Ship Crews",
  description:
    "Real-time Vietnamese-to-English voice translation through bone-conduction headsets, powered by Agora CAI and Solana audit trails. Built for Convo AI Hackathon Đà Nẵng 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
