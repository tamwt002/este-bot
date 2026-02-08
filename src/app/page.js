"use client"
import { useState } from "react"
import UrlForm from "./components/UrlForm"
import AuditSection from "./components/AuditSection"

export default function Home() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  async function runAudit(url) {
    setLoading(true)
    const res = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    })

    const data = await res.json()
    setReport(data)
    setLoading(false)
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-wide text-zinc-500">
          SEO Audit Tool
        </p>
        <h1 className="text-5xl font-bold tracking-tight">
          EsteBot
        </h1>
      </div>

      <UrlForm onSubmit={runAudit} loading={loading} />

      {report && <AuditSection report={report} />}
      {loading && (
      <p className="text-sm text-zinc-500 mt-4">
        Crawling page and analysing SEO…
      </p>
    )}
    </main>
  )
}
