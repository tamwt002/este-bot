"use client"
import { useState } from "react"
import Image from "next/image"
import logo from "@/assets/logo.png"
import UrlForm from "./UrlForm"
import ScanProgress from "./ScanProgress"
import FindingsReport from "./FindingsReport"
import Icon from "./Icon"

/**
 * Shared shell for the SEO and Security audit pages: hero, form,
 * what-we-check empty state, progress, errors and the report.
 */
export default function AuditPage({
  kind,
  endpoint,
  title,
  intro,
  greeting,
  steps,
  checks,
  note,
  requireConsent = false,
  timeoutMs = 45000,
  Details
}) {
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
      setError("That doesn't look like a web address. Try something like your-app.lovable.app")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requireConsent ? { url, consent } : { url }),
        signal: AbortSignal.timeout(timeoutMs)
      })

      const data = await res.json()

      if (!res.ok || !data.findings) {
        setError(data.error || "Something went wrong.")
      } else {
        setReport(data)

        setTimeout(() => {
          document
            .getElementById("audit-results")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 120)
      }
    } catch (err) {
      setError(
        err.name === "TimeoutError"
          ? "The site took too long to answer. Give it another go."
          : "Couldn't reach EsteBot. Check your connection and try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* HERO */}
      <section>
        <div className="flex items-center gap-3 sm:gap-4">
          <Image src={logo} alt="" unoptimized width={96} height={96} priority className="w-16 h-16 sm:w-20 sm:h-20 shrink-0" />
          <p className="rounded-2xl rounded-bl-sm bg-surface outlined pop-sm px-4 py-3 text-sm sm:text-base font-bold text-ink max-w-md">
            {greeting}
          </p>
        </div>

        <div className="mt-6 sm:mt-8 space-y-4">
          <h1 className="text-[2rem] sm:text-5xl font-black tracking-tight leading-[1.05]">{title}</h1>
          <p className="text-muted text-base sm:text-lg leading-relaxed max-w-[60ch]">{intro}</p>
        </div>

        <div className="mt-8 sm:mt-10">
          <UrlForm onSubmit={runAudit} loading={loading} requireConsent={requireConsent} />
        </div>
      </section>

      {/* STATUS */}
      {error && (
        <div
          role="alert"
          className="flex gap-3 items-start rounded-2xl outlined pop-sm px-4 py-3.5 font-semibold animate-rise"
          style={{
            background: "color-mix(in oklch, var(--critical) 12%, transparent)"
          }}
        >
          <Icon name="circleAlert" className="w-5 h-5 mt-0.5 shrink-0 text-critical" />
          <span>{error}</span>
        </div>
      )}

      {loading && <ScanProgress steps={steps} />}

      {/* RESULTS */}
      {report && (
        <div id="audit-results" className="scroll-mt-24">
          <FindingsReport report={report} kind={kind}>
            {Details && <Details report={report} />}
          </FindingsReport>
        </div>
      )}

      {/* EMPTY STATE: what gets checked */}
      {!report && !loading && (
        <section aria-labelledby="checks-heading" className="pt-10 sm:pt-12 border-t-2 border-dashed border-line">
          <h2 id="checks-heading" className="text-2xl font-black mb-7">
            What I sniff for
          </h2>
          <div className="grid gap-x-10 gap-y-9 sm:grid-cols-3">
            {checks.map(group => (
              <div key={group.title}>
                <h3 className="flex items-center gap-2.5 text-lg font-extrabold mb-4">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-raised outlined text-accent-text">
                    <Icon name={group.icon} className="w-5 h-5" />
                  </span>
                  {group.title}
                </h3>
                <ul className="space-y-2.5 text-[0.9375rem] leading-snug text-muted">
                  {group.items.map(item => (
                    <li key={item} className="flex gap-2">
                      <Icon name="check" className="w-4 h-4 mt-0.5 shrink-0 text-pass" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {note && (
            <p className="mt-10 flex gap-2.5 items-start text-[0.9375rem] text-muted max-w-[70ch]">
              <Icon name="lock" className="w-4 h-4 mt-0.5 shrink-0 text-accent-text" />
              <span>{note}</span>
            </p>
          )}
        </section>
      )}
    </div>
  )
}
