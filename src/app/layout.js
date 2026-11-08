import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import JsonLd from "./components/JsonLd";
import { PAGES, SITE_URL, siteJsonLd } from "./lib/site";

// Rounded, friendly sans used for everything (self-hosted by next/font)
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

// Applies the saved theme before first paint (dark is the default).
const themeScript = `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

// SEO metadata (Top-level export)
// Social preview images come from opengraph-image.js / twitter-image.js
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: PAGES.seo.title, template: "%s | EsteBot" },
  description: PAGES.seo.description,
  applicationName: "EsteBot",
  keywords: [
    "vibe coding", "Lovable SEO", "SEO checker", "website security scanner",
    "exposed API key checker", "accessibility checker", "Bolt", "v0", "Cursor", "Replit"
  ],
  authors: [{ name: "Tinotenda Tamangani", url: "https://wallace.woztech.world" }],
  openGraph: {
    title: PAGES.seo.title,
    description: PAGES.seo.description,
    siteName: "EsteBot",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGES.seo.title,
    description: PAGES.seo.description,
  },
};

export const viewport = {
  themeColor: "#1c1611",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg text-ink font-sans min-h-screen flex flex-col">
        <JsonLd data={siteJsonLd} />
        <Navbar />
        <main className="page-container pt-10 pb-16 sm:pt-14 sm:pb-24 flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
