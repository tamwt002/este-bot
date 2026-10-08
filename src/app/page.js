"use client"

import { useState } from "react"
import UrlForm from "./components/UrlForm"
import AuditSection from "./components/AuditSection"
import FindingsReport from "./components/FindingsReport"

export default function SeoAuditPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function runAudit(input) {
    setError(null)
    setReport(null)

    const url = /^https?:\/\//i.test(input) ? input : `https://${input}`

    try {
      new URL(url)
    } catch {
      setError("Please enter a valid URL.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(45000)
      })

      const data = await res.json()

      if (!res.ok || !data.findings) {
        setError(data.error || "Something went wrong.")
      } else {
        setReport(data)

        setTimeout(() => {
          document
            .getElementById("audit-results")
            ?.scrollIntoView({ behavior: "smooth" })
        }, 150)
      }
    } catch (err) {
      setError(
        err.name === "TimeoutError"
          ? "The audit timed out. Try again."
          : "Network error. Try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">SEO Audit</h1>
        <p className="text-zinc-600 max-w-2xl">
          Built your site with Lovable, Bolt, v0, Cursor or Replit? Check whether Google
          can actually see it. EsteBot looks for the SEO mistakes AI-built sites make most,
          like blank pages for crawlers, template titles and leftover noindex tags, and gives
          you a prompt to paste back into your AI tool to fix each one.
        </p>
      </div>

      <UrlForm onSubmit={runAudit} loading={loading} />

      {error && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-zinc-600">
          <div className="animate-spin h-5 w-5 border-2 border-zinc-400 border-t-transparent rounded-full" />
          Running audit…
        </div>
      )}

      {report && (
        <div id="audit-results">
          <FindingsReport report={report} kind="SEO">
            <AuditSection report={report} />
          </FindingsReport>
        </div>
      )}
    </div>
  )
}
