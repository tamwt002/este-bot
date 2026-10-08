import Link from "next/link"
import LegalSection from "../components/LegalSection"

export const metadata = {
  title: "Privacy Policy | EsteBot",
  description: "What EsteBot collects (very little), how it's used, and what is never stored."
}

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-zinc-500">Last updated: 8 October 2026</p>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-900">
          <strong>In short:</strong> no accounts, no cookies, no ads. We count page visits with
          cookie-free, anonymous analytics. The URLs you scan and the results are not saved. Your IP
          address is held in memory for about a minute for rate limiting.
        </div>
      </header>

      <LegalSection title="1. Who we are">
        <p>
          EsteBot is operated by WozTech (&quot;we&quot;, &quot;us&quot;). This policy explains what
          information the EsteBot website at <code>estebot.woztech.world</code> handles when you use it.
        </p>
      </LegalSection>

      <LegalSection title="2. What we handle and why">
        <ul>
          <li>
            <strong>The URL you submit.</strong> This is sent to our server so it can run the audit.
            It is used only for that request and is not saved to a database.
          </li>
          <li>
            <strong>Content fetched from that URL.</strong> Our server downloads the page, some of
            its JavaScript files, and a few standard files (such as <code>robots.txt</code> and{" "}
            <code>sitemap.xml</code>). This is processed in memory to produce your report, then
            discarded. Any secret keys found are redacted before the report leaves our server.
          </li>
          <li>
            <strong>Your audit results.</strong> These are sent back to your browser only. We don&apos;t
            store them, and they disappear when you close or refresh the page.
          </li>
          <li>
            <strong>Your IP address.</strong> This is kept in server memory for about one minute to
            enforce rate limits and prevent abuse. It is not written to a database.
          </li>
          <li>
            <strong>Anonymous usage analytics.</strong> We use Vercel Web Analytics to count page
            views and see which pages are used. It records the page visited, the referring site,
            and general device, browser and country information. It uses no cookies, and doesn&apos;t
            identify you or track you across other websites. The URLs you scan are not sent to it.
          </li>
          <li>
            <strong>Hosting and error logs.</strong> Like any website, our hosting provider may
            automatically record standard request information (IP address, time, requested path,
            browser user agent) for security and reliability, and our server may log technical
            error details, which can include the URL being scanned. These logs are kept for a
            limited time and used only to operate and protect the Service.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. What we don't do">
        <ul>
          <li>No user accounts, sign-ups or email collection.</li>
          <li>No cookies, cross-site tracking, tracking pixels or advertising.</li>
          <li>No selling, renting or sharing of your information for marketing.</li>
          <li>
            Fonts are served from our own server, so loading the site doesn&apos;t send your
            information to Google or other font services.
          </li>
          <li>
            &quot;Copy fix prompt&quot; copies text to your own clipboard. Nothing is sent to us or to
            any AI service.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. The websites you scan">
        <p>
          When you run an audit, our server sends requests to the website you entered. That
          website will see our server&apos;s IP address and the{" "}
          <Link href="/bot">EsteBot user agent</Link>, not yours. Please only scan sites you are
          authorised to test. See the <Link href="/disclaimer">Disclaimer &amp; Acceptable Use</Link>{" "}
          policy.
        </p>
      </LegalSection>

      <LegalSection title="5. Where data is processed">
        <p>
          Our hosting provider may process requests on servers outside your country. We only use
          providers that apply appropriate security measures.
        </p>
      </LegalSection>

      <LegalSection title="6. Security">
        <p>
          The site is served over HTTPS, outbound requests are restricted to public internet
          addresses, and we keep what we handle to the minimum needed to run the Service.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          Because we don&apos;t keep accounts or audit history, there is generally nothing stored
          about you to access, correct or delete. Depending on where you live (for example under the
          Australian Privacy Principles or the GDPR), you may still have rights regarding personal
          information. Contact us and we&apos;ll help.
        </p>
      </LegalSection>

      <LegalSection title="8. Children">
        <p>EsteBot is not directed at children under 16.</p>
      </LegalSection>

      <LegalSection title="9. Changes and contact">
        <p>
          We may update this policy; the date at the top shows the latest version. For privacy
          questions, contact us via <a href="https://www.woztech.world">woztech.world</a>.
        </p>
      </LegalSection>
    </article>
  )
}
