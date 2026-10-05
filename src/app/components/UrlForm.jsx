"use client"
import { useState } from "react"
import Link from "next/link"

export default function UrlForm({ onSubmit, loading, requireConsent = false }) {
  const [url, setUrl] = useState("")
  const [consent, setConsent] = useState(false)

  const blocked = loading || (requireConsent && !consent)

  return (
    <form
        onSubmit={(e) => {
            e.preventDefault()
            if (blocked) return
            onSubmit(url.trim(), consent)
        }}
        className="bg-white shadow-sm border rounded-xl p-4 mb-10 space-y-3"
        >
        <div className="flex flex-col sm:flex-row gap-3">
            <input
                className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://your-app.lovable.app"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
            />

            <button
                className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 transition disabled:opacity-50"
                disabled={blocked}
            >
                {loading ? "Auditing…" : "Run Audit"}
            </button>
        </div>

        {requireConsent && (
            <label className="flex items-start gap-2 text-sm text-zinc-600 cursor-pointer">
                <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                    I own this site or have written permission to test it, and I agree to the{" "}
                    <Link href="/disclaimer" className="underline">Disclaimer &amp; Acceptable Use</Link>.
                </span>
            </label>
        )}
    </form>
  )
}
