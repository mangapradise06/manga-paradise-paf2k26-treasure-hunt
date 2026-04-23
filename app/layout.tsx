import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  variable: "--font-barlow",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chasse au trésor — Manga Paradise × PAF 2026",
  description:
    "Participe à la chasse au trésor Manga Paradise au Play Azure Festival 2026 et tente de gagner une figurine officielle.",
  manifest: "/manifest.json",
  applicationName: "PAF 2K26",
  appleWebApp: {
    capable: true,
    title: "PAF 2K26",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/brand/logo-manga-paradise.webp", type: "image/webp" },
      { url: "/brand/logo-manga-paradise.jpg", type: "image/jpeg" },
    ],
    apple: "/brand/logo-manga-paradise.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#DC1E44",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${barlow.variable} ${poppins.variable}`}>
      <body className="min-h-screen antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
