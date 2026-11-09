import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ShortcutsOverlay } from "@/components/ShortcutsOverlay";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// IBM Plex, not Geist — Geist is the literal default font of create-next-app
// and every v0/shadcn scaffold, which is exactly the "looks AI-generated"
// tell this swap is fixing. Plex is a real, deliberately-designed type
// family (IBM's own, built for technical/engineering contexts) rather than
// a trendy default, and using one family for both sans and mono is itself
// a considered choice rather than grabbing an unrelated "pairing" off a list.
const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: "variable",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" data-theme="dark" className={`${plexSans.variable} ${plexMono.variable}`}>
      <head>
        {/* Runs before hydration so a stored theme preference applies with zero flash on any route. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <ShortcutsOverlay />
        <Analytics />
      </body>
    </html>
  );
}
