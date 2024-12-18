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
  title: "My Chatbot",
  description: "A tool I use",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* NEEDED FOR SYNTAX HIGHLIGHTING */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/@highlightjs/cdn-assets@11.9.0/styles/nord.min.css"
        />

        <script
          crossOrigin="anonymous"
          src="https://unpkg.com/@highlightjs/cdn-assets@11.9.0/highlight.min.js"
        ></script>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen `}
      >
        {children}
      </body>
    </html>
  );
}
