"use client"
import { useState } from "react"
import UrlForm from "../components/UrlForm"
import SecurityAuditSection from "../components/SecurityAuditSection"
import FindingsReport from "../components/FindingsReport"

export default function SecurityAuditPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function runAudit(input, consent) {
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
      const res = await fetch("/api/security-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, consent }),
        signal: AbortSignal.timeout(60000)
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
        <h1 className="text-4xl font-bold">Security Audit</h1>
        <p className="text-zinc-600 max-w-2xl">
          AI tools ship fast, but they also ship API keys in your frontend code, leave
          .env files downloadable and skip security headers. EsteBot checks the live site
          for the mistakes vibe-coded apps make most. Any secrets it finds are redacted and
          never stored.
        </p>
      </div>

      <UrlForm onSubmit={runAudit} loading={loading} requireConsent />

      {error && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-zinc-600">
          <div className="animate-spin h-5 w-5 border-2 border-zinc-400 border-t-transparent rounded-full" />
          Scanning headers, JavaScript bundles and common exposed files…
        </div>
      )}

      {report && (
        <div id="audit-results">
          <FindingsReport report={report} kind="Security">
            <SecurityAuditSection report={report} />
          </FindingsReport>
        </div>
      )}
    </div>
  )
}
