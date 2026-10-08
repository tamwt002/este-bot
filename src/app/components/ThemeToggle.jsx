"use client"
import { useSyncExternalStore } from "react"
import Icon from "./Icon"

function subscribe(callback) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  return () => observer.disconnect()
}

const getTheme = () => document.documentElement.dataset.theme || "dark"
const getServerTheme = () => "dark"

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme)
  const next = theme === "dark" ? "light" : "dark"

  function toggle() {
    if (next === "light") document.documentElement.dataset.theme = "light"
    else delete document.documentElement.dataset.theme
    try {
      localStorage.setItem("theme", next)
    } catch {
      // storage unavailable (private mode): theme still applies for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="grid place-items-center w-10 h-10 rounded-xl text-muted hover:text-ink hover:bg-raised transition-colors"
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  )
}
