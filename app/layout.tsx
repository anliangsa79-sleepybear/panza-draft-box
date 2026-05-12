import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "潘沙的草稿箱",
  description: "写作、资料、想法和未完成的句子",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
