"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import logo from "@/assets/logo.png"
import Icon from "./Icon"

const STEP_MS = 1800

/**
 * Step-by-step checklist shown while a scan runs. The server does all the
 * work in one request, so steps advance on a timer and the last one waits
 * until the response arrives.
 */
export default function ScanProgress({ steps }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => Math.min(c + 1, steps.length - 1))
    }, STEP_MS)
    return () => clearInterval(timer)
  }, [steps.length])

  return (
    <div className="panel p-5 sm:p-6 flex gap-5 items-start animate-rise" role="status" aria-live="polite">
      <Image src={logo} alt="" unoptimized width={64} height={64} className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 animate-sniff" />
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-lg">Sniffing around your site…</p>
        <ol className="mt-3 space-y-2">
          {steps.map((step, i) => {
            const done = i < current
            const active = i === current
            return (
              <li
                key={step}
                className={`flex items-center gap-2.5 text-sm transition-colors ${
                  done ? "text-muted" : active ? "text-ink font-bold" : "text-subtle"
                }`}
              >
                {done ? (
                  <Icon name="check" className="w-4 h-4 text-pass shrink-0" strokeWidth={3} />
                ) : active ? (
                  <Icon name="loader" className="w-4 h-4 text-accent shrink-0 animate-spin" strokeWidth={3} />
                ) : (
                  <span className="w-4 h-4 shrink-0 grid place-items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-line-strong" />
                  </span>
                )}
                {step}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
