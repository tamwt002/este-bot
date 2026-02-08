"use client"
import { useState } from "react"

export default function UrlForm({ onSubmit, loading }) {
  const [url, setUrl] = useState("")

  return (
    <form
        onSubmit={(e) => {
            e.preventDefault()
            onSubmit(url)
        }}
        className="bg-white shadow-sm border rounded-xl p-4 flex gap-3 mb-10"
        >
        <input
            className="flex-1 px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
        />

        <button
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 transition disabled:opacity-50"
            disabled={loading}
        >
            {loading ? "Auditing…" : "Run Audit"}
        </button>
    </form>
  )
}
