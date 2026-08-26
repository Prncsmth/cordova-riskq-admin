import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GlobalErrorGuards from "@/components/GlobalErrorGuards";
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
  title: "Cordova RiskQ Admin",
  description: "Admin dashboard scaffold for the Cordova RiskQ emergency operations platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalErrorGuards />
        {children}
      </body>
    </html>
  );
}
