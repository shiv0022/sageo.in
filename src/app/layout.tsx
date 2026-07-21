import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SEO-AEO-GEO Intelligence Platform",
  description:
    "Analyze any website. Find every ranking opportunity. Discover technical issues, content gaps, competitor advantages and implementation opportunities using SEO, AEO and GEO intelligence.",
  keywords: [
    "SEO analysis",
    "AEO analysis",
    "GEO analysis",
    "website audit",
    "competitor analysis",
    "content intelligence",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
