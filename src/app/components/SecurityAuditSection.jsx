import { DataList, Row } from "./DataList"

const HEADER_LABELS = {
  csp: "Content-Security-Policy",
  xFrame: "Clickjacking protection",
  xContentType: "X-Content-Type-Options",
  referrerPolicy: "Referrer-Policy",
  permissionsPolicy: "Permissions-Policy"
}

const yesNo = (v, yes = "Yes", no = "No") => (v ? yes : no)

export default function SecurityAuditSection({ report }) {
  const { checks } = report

  return (
    <div className="space-y-6">
      <DataList title="Transport">
        <Row label="HTTPS" value={yesNo(checks.transport.https)} />
        <Row label="HTTP → HTTPS" value={yesNo(checks.transport.httpRedirectsToHttps, "Redirects", "No redirect")} />
        <Row label="HSTS" value={yesNo(checks.transport.hsts, "Enabled", "Missing")} />
      </DataList>

      <DataList title="Security headers">
        {Object.entries(checks.headers).map(([key, value]) => (
          <Row key={key} label={HEADER_LABELS[key] || key} value={yesNo(value, "Present", "Missing")} />
        ))}
      </DataList>

      <DataList title="Exposure">
        <Row label="Server" value={checks.exposure.server || "Hidden"} />
        <Row label="X-Powered-By" value={checks.exposure.xPoweredBy || "Hidden"} />
        <Row label="JS files scanned" value={String(checks.scriptsScanned ?? 0)} />
        <Row label="Secrets found" value={String(checks.secrets?.length ?? 0)} />
        <Row label="Exposed files" value={checks.exposedFiles?.length ? checks.exposedFiles.join(", ") : "None"} />
        <Row label="Source maps" value={checks.sourceMaps?.length ? checks.sourceMaps.join(", ") : "None"} />
        <Row
          label="Backend"
          value={[checks.backend?.supabase && "Supabase", checks.backend?.firebase && "Firebase"].filter(Boolean).join(", ") || "None detected"}
        />
      </DataList>
    </div>
  )
}
