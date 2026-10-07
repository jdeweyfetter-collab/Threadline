import type { Metadata } from "next";
import "./globals.css";
import "./closet.css";

export const metadata: Metadata = {
  title: "Threadling — your wardrobe, considered",
  description: "Photograph, catalog and rediscover your wardrobe. Track what you wear.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport = {width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#faf9f6'};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
