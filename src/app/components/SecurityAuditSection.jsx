import ScoreCard from "./ScoreCard"

export default function SecurityAuditSection({ report }) {
  const { checks } = report

  const headerScore =
    Object.values(checks.headers).filter(Boolean).length

  return (
    <div className="space-y-10">
      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          label="HTTPS"
          value={checks.transport.https ? "Enabled" : "Missing"}
          ok={checks.transport.https}
        />

        <ScoreCard
          label="Security Headers"
          value={`${headerScore}/5`}
          ok={headerScore >= 4}
        />

        <ScoreCard
          label="Info Exposure"
          value={
            checks.exposure.server || checks.exposure.xPoweredBy
              ? "Exposed"
              : "Clean"
          }
          ok={!checks.exposure.server && !checks.exposure.xPoweredBy}
        />
      </div>

      {/* TRANSPORT */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-2">
          Transport Security
        </h2>

        <ul className="space-y-2 text-sm">
          <li>
            HTTPS:{" "}
            <strong>
              {checks.transport.https ? "Yes" : "No"}
            </strong>
          </li>
          <li>
            HSTS:{" "}
            <strong>
              {checks.transport.hsts ? "Enabled" : "Missing"}
            </strong>
          </li>
        </ul>
      </div>

      {/* HEADERS */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-2">
          Security Headers
        </h2>

        <ul className="space-y-2 text-sm">
          {Object.entries(checks.headers).map(
            ([key, value]) => (
              <li key={key}>
                {key}:{" "}
                <strong>
                  {value ? "Present" : "Missing"}
                </strong>
              </li>
            )
          )}
        </ul>
      </div>

      {/* EXPOSURE */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-2">
          Information Exposure
        </h2>

        <ul className="space-y-2 text-sm">
          <li>
            Server header:{" "}
            <strong>
              {checks.exposure.server || "Hidden"}
            </strong>
          </li>
          <li>
            X-Powered-By:{" "}
            <strong>
              {checks.exposure.xPoweredBy || "Hidden"}
            </strong>
          </li>
        </ul>
      </div>
    </div>
  )
}
