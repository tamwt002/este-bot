import Icon from "./Icon"

// Server-rendered FAQ: real text in the HTML for search engines and readers.
export default function Faq({ faqs, title = "Common questions" }) {
  return (
    <section aria-labelledby="faq-heading" className="mt-16 sm:mt-20 pt-10 sm:pt-12 border-t-2 border-dashed border-line">
      <h2 id="faq-heading" className="text-2xl font-black mb-6">{title}</h2>
      <div className="panel divide-y-2 divide-line overflow-hidden">
        {faqs.map(f => (
          <details key={f.q} className="group">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 font-extrabold hover:bg-raised transition-colors [&::-webkit-details-marker]:hidden">
              <h3 className="text-base">{f.q}</h3>
              <Icon name="chevron" className="w-5 h-5 text-muted shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 text-muted leading-relaxed max-w-[70ch]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
