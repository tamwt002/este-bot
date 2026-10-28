import { DataList, Row } from "./DataList"

export default function A11yAuditSection({ report }) {
  const { checks } = report
  const c = checks.counts

  return (
    <div className="space-y-6">
      <DataList title="Page">
        <Row label="Language" value={checks.lang} />
        <Row label="Title" value={checks.title} />
        <Row label="Viewport" value={checks.viewport} hint={checks.zoomDisabled ? "zoom blocked" : undefined} />
        <Row label="Rendered by JS" value={checks.emptyShell ? "Yes, only the HTML shell was checked" : "No"} />
      </DataList>

      <DataList title="Elements checked">
        <Row label="Images" value={`${c.images} total, ${c.imagesNoAlt} missing alt`} />
        <Row label="Form fields" value={`${c.formFields} total, ${c.unlabelledInputs} unlabelled`} />
        <Row label="Buttons" value={`${c.buttons} total, ${c.namelessButtons} without a name`} />
        <Row label="Links" value={`${c.links} total, ${c.namelessLinks} without a name`} />
        <Row label="Embeds" value={String(c.iframes)} />
        <Row label="Headings" value={checks.headingOutline || "None"} />
      </DataList>
    </div>
  )
}
