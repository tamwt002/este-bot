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
          <li>Requests the single page a user submitted, its own JavaScript files, and standard files like <code>/robots.txt</code> and <code>/sitemap.xml</code>.</li>
          <li>For security audits, checks whether a few sensitive paths (such as <code>/.env</code> and <code>/.git/config</code>) are publicly reachable. Their contents are never shown or stored.</li>
          <li>Security audits require the user to confirm they own the site or have permission to test it.</li>
          <li>Does not crawl beyond these files, log in, submit forms, or attempt to exploit anything.</li>
          <li>Is rate-limited per user.</li>
        </ul>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-lg">User agent</h2>
        <pre className="bg-zinc-100 p-3 rounded text-sm overflow-auto">
          Mozilla/5.0 (compatible; EsteBot/1.0; +https://estebot.woztech.world/bot)
        </pre>
      </div>

      <p className="text-zinc-600">
        Questions or concerns? Get in touch via{" "}
        <a href="https://www.woztech.world" className="underline">
          woztech.world
        </a>
        .
      </p>
    </div>
  )
}
