import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FreshPredict - AI Inventory Management for Malaysian SME Grocers",
  description: "Reduce food waste by 40%, optimize inventory with AI-powered demand forecasting, and achieve 2026 ESG compliance. Built for Malaysian SME grocers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-slate-50 text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}
