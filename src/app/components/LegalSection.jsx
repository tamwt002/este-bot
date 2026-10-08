export default function LegalSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="space-y-3 text-muted leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:underline [&_a]:text-accent-text [&_a]:font-bold [&_a]:underline-offset-2">
        {children}
      </div>
    </section>
  )
}
