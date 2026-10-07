"use client"
import { useState } from "react"

const SEVERITY_STYLES = {
  critical: { label: "Critical", badge: "bg-red-600 text-white", border: "border-l-red-600" },
  high: { label: "High", badge: "bg-orange-500 text-white", border: "border-l-orange-500" },
  medium: { label: "Medium", badge: "bg-amber-400 text-zinc-900", border: "border-l-amber-400" },
  low: { label: "Low", badge: "bg-zinc-200 text-zinc-800", border: "border-l-zinc-300" },
  info: { label: "Heads up", badge: "bg-sky-100 text-sky-800", border: "border-l-sky-300" }
}

const GRADE_STYLES = {
  A: "bg-green-600",
  B: "bg-lime-600",
  C: "bg-amber-500",
  D: "bg-orange-500",
  F: "bg-red-600"
}

export default function FindingsReport({ report, kind, children }) {
  const { summary, findings, passed, stack, url } = report
  const issues = findings.filter(f => f.severity !== "info")
  const notes = findings.filter(f => f.severity === "info")

  return (
    <div className="space-y-8">
      {/* SUMMARY */}
      <div className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm flex gap-4 sm:gap-6 items-center">
        <div
          className={`${GRADE_STYLES[summary.grade]} text-white rounded-2xl w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center shrink-0`}
        >
          <span className="text-4xl sm:text-5xl font-bold leading-none">{summary.grade}</span>
          <span className="text-xs sm:text-sm mt-1 opacity-90">{summary.score}/100</span>
        </div>

        <div className="space-y-2 min-w-0">
          <h2 className="text-xl font-semibold">{kind} report</h2>
          <p className="text-sm text-zinc-500 break-all">{url}</p>
          {stack?.length > 0 && (
            <p className="text-sm text-zinc-600">
              Detected: <strong>{stack.join(" · ")}</strong>
            </p>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            {["critical", "high", "medium", "low"].map(s =>
              summary.counts[s] > 0 ? (
                <span key={s} className={`px-2 py-1 rounded-full ${SEVERITY_STYLES[s].badge}`}>
                  {summary.counts[s]} {SEVERITY_STYLES[s].label}
                </span>
              ) : null
            )}
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
              {passed.length} passed
            </span>
          </div>
        </div>
      </div>

      {/* ISSUES */}
      {issues.length === 0 ? (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          No issues found. Nice work.
        </div>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">What to fix ({issues.length})</h2>
          {issues.map((f, i) => (
            <FindingCard key={`${f.id}-${i}`} finding={f} url={url} />
          ))}
        </section>
      )}

      {/* NOTES */}
      {notes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Worth checking</h2>
          {notes.map((f, i) => (
            <FindingCard key={`${f.id}-${i}`} finding={f} url={url} />
          ))}
        </section>
      )}

      {/* PASSED */}
      {passed.length > 0 && (
        <details className="bg-white border rounded-xl p-6 shadow-sm">
          <summary className="font-semibold cursor-pointer">
            Passed checks ({passed.length})
          </summary>
          <ul className="mt-4 space-y-1 text-sm text-zinc-700">
            {passed.map(p => (
              <li key={p}>✓ {p}</li>
            ))}
          </ul>
        </details>
      )}

      {/* RAW DETAILS */}
      {children && (
        <details className="bg-white border rounded-xl p-6 shadow-sm">
          <summary className="font-semibold cursor-pointer">Technical details</summary>
          <div className="mt-6">{children}</div>
        </details>
      )}
    </div>
  )
}

function FindingCard({ finding: f, url }) {
  const [copied, setCopied] = useState(false)
  const style = SEVERITY_STYLES[f.severity]

  async function copyPrompt() {
    const prompt = [
      `EsteBot found this issue on my site (${url}):`,
      "",
      `${f.title}`,
      f.detail,
      f.evidence ? `\nEvidence: ${f.evidence}` : "",
      "",
      `Please fix it: ${f.fix}`
    ].join("\n")

    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const copyButton = (
    <button
      type="button"
      onClick={copyPrompt}
      className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 transition shrink-0 whitespace-nowrap"
    >
      {copied ? "Copied ✓" : "Copy fix prompt"}
    </button>
  )

  return (
    <div className={`bg-white border border-l-4 ${style.border} rounded-xl p-4 sm:p-5 shadow-sm space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>
            {style.label}
          </span>
          <h3 className="font-semibold">{f.title}</h3>
        </div>
        <div className="hidden sm:block">{copyButton}</div>
      </div>

      <p className="text-sm text-zinc-700">{f.detail}</p>

      {f.evidence && (
        <p className="text-xs font-mono bg-zinc-100 rounded px-2 py-1 break-all">
          {f.evidence}
        </p>
      )}

      <p className="text-sm">
        <span className="font-medium">How to fix: </span>
        <span className="text-zinc-700">{f.fix}</span>
      </p>

      <div className="sm:hidden pt-1">{copyButton}</div>
    </div>
  )
}
