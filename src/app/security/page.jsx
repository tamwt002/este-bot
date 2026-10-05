"use client"
import { useState } from "react"
import UrlForm from "../components/UrlForm"
import SecurityAuditSection from "../components/SecurityAuditSection"

export default function SecurityAuditPage() {
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
      const res = await fetch("/api/security-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(30000)
      })

      const data = await res.json()

      if (!res.ok || !data.checks) {
        setError(data.error || "Something went wrong.")
      } else {
        setReport(data)
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
      <h1 className="text-4xl font-bold mb-6">
        Security Audit
      </h1>

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
        <SecurityAuditSection report={report} />
      )}
    </div>
  )
}
