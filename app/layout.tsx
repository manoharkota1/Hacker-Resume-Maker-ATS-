import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Inter,
  Roboto,
  Lora,
  Source_Sans_3,
} from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hackora.tech";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Hackora - Smart ATS Resume Builder | Build. Stand Out. Get Hired.",
    template: "%s | Hackora",
  },
  description:
    "Create ATS-optimized resumes with Hackora's smart resume builder. Get real-time ATS scoring, MAANG company templates, and professional formatting. Build resumes that pass applicant tracking systems and land interviews at top tech companies.",
  keywords: [
    "resume builder",
    "ATS optimization",
    "ATS resume checker",
    "applicant tracking system",
    "professional resume",
    "resume templates",
    "MAANG resume",
    "tech resume",
    "free resume builder",
    "online resume maker",
    "CV builder",
    "job application",
    "career tools",
    "resume analyzer",
    "resume scoring",
  ],
  authors: [{ name: "Hackora" }],
  creator: "Hackora",
  publisher: "Hackora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Hackora - Smart ATS Resume Builder",
    description:
      "Create ATS-optimized resumes that pass applicant tracking systems. Real-time scoring, MAANG templates, and professional formatting.",
    siteName: "Hackora",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Hackora - Smart ATS Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hackora - Smart ATS Resume Builder",
    description:
      "Create ATS-optimized resumes that pass applicant tracking systems. Real-time scoring, MAANG templates, and professional formatting.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@hackora",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F2A44" },
    { media: "(prefers-color-scheme: dark)", color: "#0F2A44" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icon.svg",
      },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${inter.variable} ${roboto.variable} ${lora.variable} ${sourceSans.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <AuthProvider>
          {children} <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
