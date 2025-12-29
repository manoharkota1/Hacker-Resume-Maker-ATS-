import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://hackora.tech"),
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
    url: "https://hackora.tech",
    title: "Hackora - Smart ATS Resume Builder",
    description:
      "Create ATS-optimized resumes that pass applicant tracking systems. Real-time scoring, MAANG templates, and professional formatting.",
    siteName: "Hackora",
    images: [
      {
        url: "https://hackora.tech/og-image.png",
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
    images: ["https://hackora.tech/og-image.png"],
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
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://hackora.tech",
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
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
