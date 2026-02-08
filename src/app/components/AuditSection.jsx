import ScoreCard from "./ScoreCard"

export default function AuditSection({ report }) {
  const { onPage } = report

  return (
    <div className="space-y-10">
      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard
          label="Title Tags"
          value={`${onPage.title.count}`}
          ok={onPage.title.count === 1}
        />

        <ScoreCard
          label="Meta Description"
          value={`${onPage.metaDescription.length} chars`}
          ok={onPage.metaDescription.ok}
        />

        <ScoreCard
          label="Images w/o Alt"
          value={onPage.images.missingAlt}
          ok={onPage.images.missingAlt === 0}
        />
      </div>

      {/* TITLE TAG SECTION */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Title Tag</h2>

          {onPage.title.count !== 1 && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
              {onPage.title.count} titles found
            </span>
          )}
        </div>

        <p
          className="text-zinc-800 line-clamp-2 cursor-help"
          title={onPage.title.value}
        >
          {onPage.title.value || "Missing"}
        </p>

        <p className="text-sm text-zinc-500 mt-2">
          Best practice: exactly 1 title, 30–60 characters
        </p>

        {onPage.title.count > 1 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-blue-600">
              View all title tags
            </summary>

            <ul className="mt-3 text-sm space-y-2 max-h-64 overflow-auto border rounded-lg p-3">
              {onPage.title.all.map((title, i) => (
                <li
                  key={i}
                  className="border-b last:border-none pb-2"
                >
                  <span className="text-zinc-500 mr-2">
                    #{i + 1}
                  </span>
                  {title || "(empty title)"}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* META DESCRIPTION */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-2">
          Meta Description
        </h2>

        <p
          className="text-zinc-800 line-clamp-3 cursor-help"
          title={onPage.metaDescription.value}
        >
          {onPage.metaDescription.value || "Missing"}
        </p>

        <p className="text-sm text-zinc-500 mt-2">
          Recommended: 120–160 characters
        </p>
      </div>

      {/* IMAGE ALT TEXT */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-2">
          Image Alt Text
        </h2>

        <p>Total images: {onPage.images.total}</p>

        <p
          className={
            onPage.images.missingAlt === 0
              ? "text-green-600"
              : "text-red-600"
          }
        >
          Missing alt text: {onPage.images.missingAlt}
        </p>
      </div>
    </div>
  )
}
