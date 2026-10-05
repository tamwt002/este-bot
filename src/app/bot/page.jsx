export const metadata = {
  title: "EsteBot Crawler | EsteBot",
  description: "Information about the EsteBot user agent for site owners."
}

export default function BotPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-4xl font-bold">About EsteBot</h1>

      <p>
        If you found <code className="bg-zinc-100 px-1 rounded">EsteBot/1.0</code> in
        your server logs, a user of this site ran an on-demand SEO or security
        audit against one of your pages.
      </p>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-lg">What it does</h2>
        <ul className="list-disc pl-5 space-y-2 text-zinc-700">
          <li>Requests only the single page a user submitted, plus <code>/robots.txt</code>.</li>
          <li>Does not crawl or follow links, and does not store page contents.</li>
          <li>Reads public HTML and HTTP response headers only.</li>
          <li>Is rate-limited per user.</li>
        </ul>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-lg">User agent</h2>
        <pre className="bg-zinc-100 p-3 rounded text-sm overflow-auto">
          Mozilla/5.0 (compatible; EsteBot/1.0; +https://wallace.woztech.world/bot)
        </pre>
      </div>

      <p className="text-zinc-600">
        Questions or concerns? Get in touch via{" "}
        <a href="https://wallace.woztech.world" className="underline">
          wallace.woztech.world
        </a>
        .
      </p>
    </div>
  )
}
