"use client"
import { useState } from "react"
import Icon from "./Icon"

const SEVERITY = {
  critical: { label: "Critical", icon: "octagon", color: "var(--critical)" },
  high: { label: "High", icon: "triangle", color: "var(--high)" },
  medium: { label: "Medium", icon: "circleAlert", color: "var(--medium)" },
  low: { label: "Low", icon: "minus", color: "var(--low)" },
  info: { label: "Heads up", icon: "info", color: "var(--info)" }
}

const GROUPS = [
  { title: "Fix these first", hint: "These can hurt you right now.", severities: ["critical", "high"], open: true },
  { title: "Then these", hint: "Worth sorting before you launch.", severities: ["medium"] },
  { title: "Polish", hint: "Small wins when you have a minute.", severities: ["low"] },
  { title: "Worth checking yourself", hint: "Things I can't test from outside.", severities: ["info"] }
]

const GRADES = {
  A: { color: "var(--pass)", line: "Sweet as! Your site's in great shape." },
  B: { color: "var(--grade-b)", line: "Pretty good! Just a few things to tidy up." },
  C: { color: "var(--medium)", line: "Not bad, but there's some work to do." },
  D: { color: "var(--high)", line: "Hmm. A few things need fixing before launch." },
  F: { color: "var(--critical)", line: "Yikes. Let's fix the big ones first, together." }
}

const tint = (color, pct) => `color-mix(in oklch, ${color} ${pct}%, transparent)`

export default function FindingsReport({ report, kind, children }) {
  const { summary, findings, passed, stack, url } = report
  const grade = GRADES[summary.grade]
  const issues = findings.filter(f => f.severity !== "info")
  const urgent = summary.counts.critical + summary.counts.high

  return (
    <div className="space-y-8 animate-rise">
      {/* SUMMARY */}
      <section className="panel p-5 sm:p-7">
        <div className="flex gap-5 sm:gap-7 items-center">
          <div
            className="grid place-items-center shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-3xl border-[2.5px] border-stroke"
            style={{
              color: grade.color,
              background: tint(grade.color, 16),
              boxShadow: "4px 4px 0 var(--shadow)"
            }}
          >
            <div className="text-center leading-none">
              <span className="block text-5xl sm:text-7xl font-black">{summary.grade}</span>
              <span className="block mt-1 text-xs sm:text-sm font-extrabold opacity-90">
                {summary.score}/100
              </span>
            </div>
          </div>

          <div className="min-w-0 space-y-1.5">
            <p className="text-sm font-extrabold text-muted">{kind} report</p>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">{grade.line}</h2>
            <p className="text-sm text-muted break-all">{url}</p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t-2 border-line flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
            {urgent > 0 && (
              <Stat color="var(--critical)" icon="octagon">
                {urgent} to fix first
              </Stat>
            )}
            {issues.length - urgent > 0 && (
              <Stat color="var(--medium)" icon="circleAlert">
                {issues.length - urgent} more to tidy
              </Stat>
            )}
            <Stat color="var(--pass)" icon="checkCircle">
              {passed.length} passed
            </Stat>
            {stack?.length > 0 && (
              <li className="text-muted font-semibold">Built with {stack.join(" + ")}</li>
            )}
          </ul>

          {findings.length > 0 && <CopyAllButton findings={findings} url={url} kind={kind} />}
        </div>
      </section>

      {/* NOTHING TO FIX */}
      {issues.length === 0 && (
        <div
          className="flex gap-3 items-center rounded-2xl outlined pop-sm px-5 py-4 font-bold"
          style={{ background: tint("var(--pass)", 14) }}
        >
          <Icon name="checkCircle" className="w-6 h-6 shrink-0 text-pass" />
          No issues found. Your kiwi is proud of you.
        </div>
      )}

      {/* GROUPED FINDINGS */}
      {GROUPS.map(group => ({
        ...group,
        items: findings.filter(f => group.severities.includes(f.severity))
      }))
        .filter(group => group.items.length > 0)
        .map((group, index) => {
        const { items } = group
        // "Then these" only makes sense after "Fix these first".
        const title = index === 0 && group.title === "Then these" ? "Start here" : group.title
        return (
          <section key={group.title} aria-label={title}>
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h3 className="text-lg font-black">
                {title} <span className="text-subtle font-extrabold">({items.length})</span>
              </h3>
              <p className="text-sm text-muted hidden sm:block">{group.hint}</p>
            </div>
            <ul className="panel divide-y-2 divide-line overflow-hidden">
              {items.map((f, i) => (
                <FindingRow key={`${f.id}-${i}`} finding={f} url={url} defaultOpen={group.open} />
              ))}
            </ul>
          </section>
        )
      })}

      {/* PASSED */}
      {passed.length > 0 && (
        <details className="panel group">
          <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-5 py-4 font-extrabold [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2.5">
              <Icon name="checkCircle" className="w-5 h-5 text-pass" />
              Passed checks ({passed.length})
            </span>
            <Icon name="chevron" className="w-5 h-5 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <ul className="px-5 pb-5 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted">
            {passed.map(p => (
              <li key={p} className="flex gap-2">
                <Icon name="check" className="w-4 h-4 mt-0.5 shrink-0 text-pass" strokeWidth={3} />
                {p}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* RAW DETAILS */}
      {children && (
        <details className="panel group">
          <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-5 py-4 font-extrabold [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2.5">
              <Icon name="file" className="w-5 h-5 text-muted" />
              Technical details
            </span>
            <Icon name="chevron" className="w-5 h-5 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5">{children}</div>
        </details>
      )}
    </div>
  )
}

function Stat({ color, icon, children }) {
  return (
    <li className="flex items-center gap-1.5">
      <span style={{ color }}>
        <Icon name={icon} className="w-4.5 h-4.5" />
      </span>
      {children}
    </li>
  )
}

function useCopy() {
  const [copied, setCopied] = useState(false)
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }
  return [copied, copy]
}

function CopyAllButton({ findings, url, kind }) {
  const [copied, copy] = useCopy()

  function buildPrompt() {
    const lines = [
      `EsteBot ran a ${kind.toLowerCase()} audit on my site (${url}) and found the issues below.`,
      "Please fix them in this order. Explain any change that needs me to act outside the code (dashboards, DNS, rotating keys).",
      ""
    ]
    findings.forEach((f, i) => {
      lines.push(`${i + 1}. [${SEVERITY[f.severity].label}] ${f.title}`)
      lines.push(`   Why it matters: ${f.detail}`)
      if (f.evidence) lines.push(`   Evidence: ${f.evidence}`)
      lines.push(`   Fix: ${f.fix}`)
      lines.push("")
    })
    return lines.join("\n")
  }

  return (
    <button type="button" onClick={() => copy(buildPrompt())} className="btn-primary text-sm py-2.5 px-4 shrink-0">
      <Icon name={copied ? "check" : "copy"} className="w-4 h-4" strokeWidth={2.75} />
      {copied ? "Copied! Paste it into your AI tool" : `Copy all ${findings.length} fixes as one prompt`}
    </button>
  )
}

function FindingRow({ finding: f, url, defaultOpen }) {
  const [copied, copy] = useCopy()
  const sev = SEVERITY[f.severity]

  function copyPrompt() {
    copy(
      [
        `EsteBot found this issue on my site (${url}):`,
        "",
        f.title,
        f.detail,
        f.evidence ? `\nEvidence: ${f.evidence}` : "",
        "",
        `Please fix it: ${f.fix}`
      ].join("\n")
    )
  }

  return (
    <li>
      <details className="group" open={defaultOpen}>
        <summary className="flex items-center gap-3 sm:gap-4 cursor-pointer list-none px-4 sm:px-5 py-4 hover:bg-raised transition-colors [&::-webkit-details-marker]:hidden">
          <span
            className="grid place-items-center w-9 h-9 rounded-xl shrink-0 outlined"
            style={{ color: sev.color, background: tint(sev.color, 16) }}
          >
            <Icon name={sev.icon} className="w-5 h-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold leading-snug">{f.title}</span>
            <span className="block text-xs font-extrabold mt-0.5" style={{ color: sev.color }}>
              {sev.label}
            </span>
          </span>
          <Icon name="chevron" className="w-5 h-5 text-muted shrink-0 transition-transform group-open:rotate-180" />
        </summary>

        <div className="px-4 sm:px-5 pb-5 sm:pl-[4.25rem] space-y-3">
          <p className="text-muted max-w-[70ch]">{f.detail}</p>

          {f.evidence && (
            <p className="text-xs font-mono bg-raised border-2 border-line rounded-lg px-3 py-2 break-all text-ink">
              {f.evidence}
            </p>
          )}

          <div className="rounded-xl bg-raised px-4 py-3">
            <p className="text-xs font-black text-accent-text mb-1">How to fix</p>
            <p className="text-sm text-ink max-w-[70ch]">{f.fix}</p>
          </div>

          <button type="button" onClick={copyPrompt} className="btn-secondary">
            <Icon name={copied ? "check" : "copy"} className="w-4 h-4" strokeWidth={2.75} />
            {copied ? "Copied!" : "Copy fix prompt"}
          </button>
        </div>
      </details>
    </li>
  )
}
