import { DataList, Row, Block, Code } from "./DataList"

export default function AuditSection({ report }) {
  const { onPage, robotsTxt } = report

  return (
    <div className="space-y-6">
      <DataList title="Page">
        <Row label="Title" value={onPage.title.value} hint={`${onPage.title.length} chars`} />
        <Row label="Description" value={onPage.metaDescription.value} hint={`${onPage.metaDescription.length} chars`} />
        <Row label="Canonical" value={onPage.canonical.value} />
        <Row label="Robots" value={onPage.robots.value} />
        <Row label="Viewport" value={onPage.viewport.value} />
        <Row label="Words" value={String(onPage.content.wordCount)} />
        <Row label="Images" value={`${onPage.images.total} total, ${onPage.images.missingAlt} missing alt`} />
        <Row label="Links" value={`${onPage.links.internalCount} internal, ${onPage.links.externalCount} external`} />
        <Row label="HTTPS" value={onPage.security.https ? "Yes" : "No"} />
      </DataList>

      <Block title="Headings">
        {onPage.headings.all.length === 0 ? (
          <p className="text-sm text-muted">No headings found.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {onPage.headings.all.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-xs font-bold text-accent-text w-7 shrink-0 pt-0.5">
                  {h.tag.toUpperCase()}
                </span>
                <span className="text-ink">{h.text || <em className="text-subtle">(empty)</em>}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title="Open Graph">
        <Code>{JSON.stringify(onPage.openGraph, null, 2)}</Code>
      </Block>

      <Block title="Twitter card">
        <Code>{JSON.stringify(onPage.twitter, null, 2)}</Code>
      </Block>

      <Block title="Structured data">
        {onPage.schema.length === 0 ? (
          <p className="text-sm text-muted">No structured data found.</p>
        ) : (
          <Code>{JSON.stringify(onPage.schema, null, 2)}</Code>
        )}
      </Block>

      <Block title="robots.txt">
        {robotsTxt ? <Code>{robotsTxt}</Code> : <p className="text-sm text-muted">Not found.</p>}
      </Block>
    </div>
  )
}
