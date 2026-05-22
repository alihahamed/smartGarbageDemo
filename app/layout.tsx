import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "500"],
});

export const metadata: Metadata = {
  title: "Smart Village App",
  description: "Unified civic platform for local municipalities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-brand-text font-sans antialiased">
        <Navbar />
        {/* Mobile Mock Container */}
        <main className="flex-1 w-full max-w-[480px] mx-auto px-4 pt-6 pb-28 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
