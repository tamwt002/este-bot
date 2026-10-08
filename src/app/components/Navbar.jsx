"use client"
import Link from "next/link"
import Image from "next/image"
import logo from "@/assets/logo.png"
import { usePathname } from "next/navigation"
import ThemeToggle from "./ThemeToggle"

const TABS = [
  { href: "/", label: "SEO", long: "SEO check" },
  { href: "/security", label: "Security", long: "Security check" }
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 border-b-2 border-line bg-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0 rounded-lg">
          <Image src={logo} alt="" unoptimized width={40} height={40} priority className="w-9 h-9" />
          <span className="text-xl font-black tracking-tight">EsteBot</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav
            aria-label="Audit type"
            className="flex rounded-xl bg-raised p-1 border-2 border-line"
          >
            {TABS.map(tab => {
              const active = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-extrabold whitespace-nowrap transition-colors ${
                    active
                      ? "bg-accent text-on-accent"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <span className="sm:hidden">{tab.label}</span>
                  <span className="hidden sm:inline">{tab.long}</span>
                </Link>
              )
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
