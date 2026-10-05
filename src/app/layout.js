import Navbar from "./components/Navbar";
import "./globals.css";
import { Inter } from "next/font/google";

// Google font
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// SEO metadata (Top-level export)
// Social preview images come from opengraph-image.js / twitter-image.js
export const metadata = {
  metadataBase: new URL("https://www.woztech.world/Esteban"),
  title: "EsteBot | In Depth Auditors",
  description: "Lightweight SEO Audit and Security Audit Tool",
  keywords: ["Cyber Security", "SEO", "Insights"],
  authors: [{ name: "Tinotenda Tamangani", url: "https://wallace.woztech.world" }],
  openGraph: {
    title: "EsteBot | In Depth Auditors",
    description: "Lightweight SEO Audit and Security Audit Tool",
    url: "/",
    siteName: "EsteBot",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EsteBot | In Depth Auditors",
    description: "Lightweight SEO Audit and Security Audit Tool",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-zinc-50 text-zinc-900 font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
