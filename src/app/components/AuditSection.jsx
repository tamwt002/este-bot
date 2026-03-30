export default function AuditSection({ report }) {
  const { onPage } = report

  return (
    <div className="space-y-10">

      {/* TITLE */}
      <Section title="Title Tag">
        <p>{onPage.title.value || "Missing"}</p>
        <p className="text-sm text-zinc-500">
          {onPage.title.length} characters
        </p>
      </Section>

      {/* META DESCRIPTION */}
      <Section title="Meta Description">
        <p>{onPage.metaDescription.value || "Missing"}</p>
        <p className="text-sm text-zinc-500">
          {onPage.metaDescription.length} characters
        </p>
      </Section>

      {/* CANONICAL */}
      <Section title="Canonical URL">
        <p>{onPage.canonical.value || "Missing"}</p>
        {onPage.canonical.mismatch && (
          <p className="text-red-600 text-sm mt-2">
            Canonical does not match page URL.
          </p>
        )}
      </Section>

      {/* ROBOTS */}
      <Section title="Robots Meta Tag">
        <p>{onPage.robots.value || "Missing"}</p>
      </Section>

      {/* VIEWPORT */}
      <Section title="Viewport">
        <p>{onPage.viewport.value || "Missing"}</p>
      </Section>

      {/* HEADINGS */}
      <Section title="Headings">
        <ul className="space-y-2">
          {onPage.headings.all.map((h, i) => (
            <li key={i}>
              <strong>{h.tag.toUpperCase()}</strong> — {h.text}
            </li>
          ))}
        </ul>
      </Section>

      {/* WORD COUNT */}
      <Section title="Content">
        <p>Word count: {onPage.content.wordCount}</p>
      </Section>

      {/* IMAGES */}
      <Section title="Images">
        <p>Total: {onPage.images.total}</p>
        <p>Missing alt: {onPage.images.missingAlt}</p>
      </Section>

      {/* LINKS */}
      <Section title="Links">
        <p>Internal: {onPage.links.internalCount}</p>
        <p>External: {onPage.links.externalCount}</p>
      </Section>

      {/* OPEN GRAPH */}
      <Section title="Open Graph">
        <pre className="bg-zinc-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(onPage.openGraph, null, 2)}
        </pre>
      </Section>

      {/* TWITTER */}
      <Section title="Twitter Cards">
        <pre className="bg-zinc-100 p-3 rounded text-sm overflow-auto">
          {JSON.stringify(onPage.twitter, null, 2)}
        </pre>
      </Section>

      {/* SCHEMA */}
      <Section title="Structured Data">
        {onPage.schema.length === 0 ? (
          <p>No structured data found.</p>
        ) : (
          <pre className="bg-zinc-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(onPage.schema, null, 2)}
          </pre>
        )}
      </Section>

      {/* SECURITY */}
      <Section title="Security">
        <p>HTTPS: {onPage.security.https ? "Yes" : "No"}</p>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="font-semibold text-lg mb-3">{title}</h2>
      {children}
    </div>
  )
}
