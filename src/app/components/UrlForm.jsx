"use client"
import { useState } from "react"
import Link from "next/link"
import Icon from "./Icon"

export default function UrlForm({ onSubmit, loading, requireConsent = false, buttonLabel = "Check my site" }) {
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
      className="space-y-3"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Website URL</span>
          <Icon
            name="search"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
          />
          <input
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface border-2 border-line text-ink text-lg font-semibold placeholder:text-subtle placeholder:font-medium focus:outline-none focus:border-accent transition-colors"
            placeholder="your-app.lovable.app"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </label>

        <button className="btn-primary h-14 text-lg sm:px-8" disabled={blocked}>
          {loading ? (
            <>
              <Icon name="loader" className="w-5 h-5 animate-spin" />
              Sniffing…
            </>
          ) : (
            buttonLabel
          )}
        </button>
      </div>

      {requireConsent && (
        <label className="flex items-start gap-3 text-sm text-muted cursor-pointer select-none max-w-2xl">
          <input
            type="checkbox"
            className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--accent)] cursor-pointer"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I own this site or have written permission to test it, and I agree to the{" "}
            <Link href="/disclaimer" className="text-accent-text font-bold underline underline-offset-2">
              Disclaimer &amp; Acceptable Use
            </Link>
            .
          </span>
        </label>
      )}
    </form>
  )
}
