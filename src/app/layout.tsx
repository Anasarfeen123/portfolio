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
  title: "Anas Arfeen | AI Engineer & Systems Developer",
  description:
    "Futuristic developer portfolio of Anas Arfeen — AI/ML Co-Lead at Microsoft Innovations Club (MIC) VIT Chennai. Specializing in Reinforcement Learning (PPO/SAC), Systems Programming, PyTorch, and Arch Linux ricing.",
  keywords: [
    "Anas Arfeen",
    "AI Engineer",
    "Reinforcement Learning",
    "PyTorch",
    "Microsoft Innovations Club",
    "VIT Chennai",
    "Autonomous Warehouse Rover",
    "PPO",
    "SAC",
    "Arch Linux",
    "Neovim",
    "Systems Developer"
  ],
  authors: [{ name: "Anas Arfeen", url: "https://github.com/codecrusader07" }],
  openGraph: {
    title: "Anas Arfeen | AI Engineer & Systems Developer",
    description:
      "Explore ANAS_OS v4.0 — An interactive digital experience showcasing autonomous RL agents, deep learning facial classifiers, CLI developer tooling, and technical research notes.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
