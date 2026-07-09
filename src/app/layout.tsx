import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevFlow AI - The Ultimate Developer Toolkit",
  description: "Ship faster with DevFlow AI. AI Chat, Prompt Library, and n8n workflows all in one place.",
};

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
