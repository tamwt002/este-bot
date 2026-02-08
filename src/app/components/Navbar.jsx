"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  const linkClass = (path) =>
    `px-4 py-2 rounded-lg text-sm font-medium ${
      pathname === path
        ? "bg-black text-white"
        : "text-zinc-600 hover:text-black"
    }`

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-lg">
          EsteBot
        </div>

        <div className="flex gap-2">
          <Link href="/" className={linkClass("/")}>
            SEO Audit
          </Link>
          <Link
            href="/security"
            className={linkClass("/security")}
          >
            Security Audit
          </Link>
        </div>
      </div>
    </nav>
  )
}
