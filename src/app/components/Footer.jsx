import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-zinc-500">
        <p>
          © {new Date().getFullYear()} WozTech. Only scan sites you own or are authorised to test.
        </p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:text-black">Privacy</Link>
          <Link href="/disclaimer" className="hover:text-black">Disclaimer</Link>
          <Link href="/bot" className="hover:text-black">About the bot</Link>
        </nav>
      </div>
    </footer>
  )
}
