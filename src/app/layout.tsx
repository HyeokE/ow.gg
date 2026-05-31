import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/ow/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "ow.gg",
  description: "오버워치 히어로, 맵, 플레이어 전적 통계 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-background">
        <TooltipProvider>
          <SiteHeader />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
