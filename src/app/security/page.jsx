"use client"
import { useState } from "react"
import UrlForm from "../components/UrlForm"
import SecurityAuditSection from "../components/SecurityAuditSection"

export default function SecurityAuditPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  async function runAudit(url) {
    setLoading(true)
    const res = await fetch("/api/security-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    })
    const data = await res.json()
    setReport(data)
    setLoading(false)
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-6">
        Security Audit
      </h1>

      <UrlForm onSubmit={runAudit} loading={loading} />

      {report && (
        <SecurityAuditSection report={report} />
      )}
    </>
  )
}
