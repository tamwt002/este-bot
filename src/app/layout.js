import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"

// Google font
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// SEO metadata (Top-level export)
// Social preview images come from opengraph-image.js / twitter-image.js
export const metadata = {
  metadataBase: new URL("https://www.woztech.world/Esteban"),
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-zinc-50 text-zinc-900 font-sans min-h-screen flex flex-col">
        <Navbar />
        <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
