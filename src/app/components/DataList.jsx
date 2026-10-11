// Small building blocks for the "Technical details" panels.

export function DataList({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-black mb-2">{title}</h4>
      <dl className="rounded-xl outlined divide-y-2 divide-line text-sm overflow-hidden">
        {children}
      </dl>
    </div>
  )
}

export function Row({ label, value, hint }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[10rem_1fr] gap-3 px-3 py-2.5">
      <dt className="font-bold text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">
        {value ? value : <span className="text-subtle italic">Missing</span>}
        {hint && <span className="ml-2 text-xs text-subtle">{hint}</span>}
      </dd>
    </div>
  )
}

export function Block({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-black mb-2">{title}</h4>
      {children}
    </div>
  )
}

export function Code({ children }) {
  return (
    <pre className="bg-raised border-2 border-line rounded-xl p-3 text-xs font-mono overflow-auto max-h-72 text-ink">
      {children}
    </pre>
  )
}
