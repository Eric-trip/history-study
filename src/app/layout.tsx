import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "史学堂 · 初中历史学习平台",
  description: "人教版初中历史学习平台 - 知识点梳理、主观题练习、答题技巧、错题本、模拟测试、每日一练",
  keywords: ["初中历史", "人教版", "历史学习", "答题技巧", "主观题"],
  authors: [{ name: "史学堂" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
