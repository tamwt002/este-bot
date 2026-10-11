import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t-2 border-line">
      <div className="page-container py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-muted">
        <p>
          © {new Date().getFullYear()} WozTech. Only scan sites you own or are authorised to test.
        </p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:text-ink font-bold">Privacy</Link>
          <Link href="/disclaimer" className="hover:text-ink font-bold">Disclaimer</Link>
          <Link href="/bot" className="hover:text-ink font-bold">About the bot</Link>
        </nav>
      </div>
    </footer>
  )
}
