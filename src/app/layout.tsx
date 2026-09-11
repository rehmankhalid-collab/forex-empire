import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forex Empire",
  description:
    "Premium forex & XAUUSD trading signals, indicators, and a free trading community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#0a0a0b] text-zinc-100">
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
            Forex Empire is a trading education & signals community. Trading
            involves risk; nothing here is financial advice.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
