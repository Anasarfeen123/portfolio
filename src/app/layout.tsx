import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { themeInitScript } from "@/lib/theme";
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
  metadataBase: new URL("https://anasarfeen.dev"),
  title: {
    default: "Anas Arfeen | AI Engineer",
    template: "%s | Anas Arfeen",
  },
  description:
    "A scroll-driven digital world tracing Anas Arfeen's evolution across AI, systems, research, and developer tooling.",
  openGraph: {
    type: "website",
    siteName: "Anas Arfeen",
    title: "Anas Arfeen | AI Engineer",
    description:
      "AI/ML Co-Lead at Microsoft Innovations Club, VIT Chennai — reinforcement learning, LLM agents, computer vision, and full-stack platforms used by real students.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anas Arfeen | AI Engineer",
    description:
      "AI/ML Co-Lead at Microsoft Innovations Club, VIT Chennai — reinforcement learning, LLM agents, computer vision, and full-stack platforms used by real students.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Runs before hydration so a stored theme preference applies with zero flash on any route. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
