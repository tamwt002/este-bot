import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"

// Rounded, friendly sans used for everything (self-hosted by next/font)
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

// Applies the saved theme before first paint (dark is the default).
const themeScript = `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

// SEO metadata (Top-level export)
// Social preview images come from opengraph-image.js / twitter-image.js
export const metadata = {
  metadataBase: new URL("https://estebot.woztech.world"),
  title: "EsteBot | In Depth Auditors",
  description: "Check your vibe-coded site before launch: SEO and security audits for apps built with Lovable, Bolt, v0, Cursor and Replit.",
  keywords: ["Cyber Security", "SEO", "Insights"],
  authors: [{ name: "Tinotenda Tamangani", url: "https://wallace.woztech.world" }],
  openGraph: {
    title: "EsteBot | In Depth Auditors",
    description: "Check your vibe-coded site before launch: SEO and security audits for apps built with Lovable, Bolt, v0, Cursor and Replit.",
    url: "/",
    siteName: "EsteBot",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EsteBot | In Depth Auditors",
    description: "Check your vibe-coded site before launch: SEO and security audits for apps built with Lovable, Bolt, v0, Cursor and Replit.",
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
        <Navbar />
        <main className="page-container py-8 sm:py-14 flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
