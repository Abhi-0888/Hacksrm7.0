import type { Metadata } from "next";
import { Share_Tech_Mono, Bebas_Neue, Rajdhani } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Providers } from "@/providers";

const mono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono"
});
const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue"
});
const ui = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani"
});

export const metadata: Metadata = {
  title: "Event Horizon — Decentralized Quai Voting",
  description: "Next-gen governance on the Quai Network.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${mono.variable} ${display.variable} ${ui.variable} font-ui antialiased selection:bg-primary selection:text-background`}>
        <Providers>
          <CustomCursor />
          <Navbar />
          <main className="relative z-10 w-full min-h-screen pt-[72px]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
