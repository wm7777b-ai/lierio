import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "会话分析处置台",
  description: "AI 副驾驶工作台基础工程（Phase 0）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
