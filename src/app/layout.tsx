import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LLMNet - The Offline Internet",
  description:
    "Search the web without the web. AI-powered search results generated locally on your machine. 100% private, instant, and offline.",
  keywords: [
    "AI search",
    "offline search",
    "LLM",
    "local AI",
    "private search",
    "search engine",
  ],
  authors: [{ name: "LLMNet" }],
  openGraph: {
    title: "LLMNet - The Offline Internet",
    description:
      "AI-powered search results generated locally. 100% private and offline.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
