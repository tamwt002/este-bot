"use client"
import Link from "next/link"
import Image from "next/image"
import logo from "@/assets/logo.png"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  const linkClass = (path) =>
    `px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
      pathname === path
        ? "bg-black text-white"
        : "text-zinc-600 hover:text-black"
    }`

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <Image src={logo} alt="" width={36} height={36} priority className="w-8 h-8 sm:w-9 sm:h-9" />
          EsteBot
        </Link>

        <div className="flex gap-1 sm:gap-2">
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
