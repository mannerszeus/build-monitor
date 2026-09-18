import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Build Monitor",
  description: "BuildForge 배포 모니터링"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}