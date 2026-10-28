"use client"
import Link from "next/link"
import Image from "next/image"
import logo from "@/assets/logo.png"
import { usePathname } from "next/navigation"
import ThemeToggle from "./ThemeToggle"

const TABS = [
  { href: "/", label: "SEO", long: "SEO check" },
  { href: "/security", label: "Security", long: "Security check" },
  { href: "/accessibility", label: "A11y", long: "Accessibility check", title: "Accessibility" }
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-20 border-b-[2.5px] border-stroke bg-bg">
      <div className="page-container h-[4.5rem] flex items-center justify-between gap-3">
        <Link href="/" aria-label="EsteBot home" className="flex items-center gap-2 shrink-0 rounded-lg">
          <Image src={logo} alt="" unoptimized width={40} height={40} priority className="w-9 h-9" />
          <span className="hidden sm:inline text-xl font-black tracking-tight">EsteBot</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav
            aria-label="Audit type"
            className="flex gap-1 rounded-xl bg-raised p-1 outlined"
          >
            {TABS.map(tab => {
              const active = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  title={tab.title}
                  className={`px-2.5 sm:px-3 lg:px-4 py-1.5 rounded-lg border-2 text-sm font-extrabold whitespace-nowrap transition-colors ${
                    active
                      ? "bg-accent text-on-accent border-stroke"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  <span className="lg:hidden">{tab.label}</span>
                  <span className="hidden lg:inline">{tab.long}</span>
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
