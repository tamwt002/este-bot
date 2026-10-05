import Link from "next/link"
import LegalSection from "../components/LegalSection"

export const metadata = {
  title: "Disclaimer & Acceptable Use | EsteBot",
  description: "Rules for using EsteBot: only scan websites you own or are authorised to test."
}

export default function DisclaimerPage() {
  return (
    <article className="max-w-3xl space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold">Disclaimer &amp; Acceptable Use</h1>
        <p className="text-sm text-zinc-500">Last updated: 5 October 2026</p>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
          <strong>In short:</strong> EsteBot is for checking <em>your own</em> websites, or sites
          you have written permission to test. It is not a tool for finding, collecting or
          exploiting other people&apos;s secrets, data or weaknesses. Using it that way is
          prohibited and may be a crime.
        </div>
      </header>

      <LegalSection title="1. What EsteBot is for">
        <p>
          EsteBot (&quot;the Service&quot;), operated by WozTech, helps website owners and developers,
          especially people building with AI tools, find common SEO and security mistakes on their
          own sites so they can fix them before launch.
        </p>
        <p>
          By using the Service you agree to this Disclaimer &amp; Acceptable Use policy and our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you don&apos;t agree, don&apos;t use the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. Authorised use only">
        <p>You may only run a Security Audit on a website if:</p>
        <ul>
          <li>you own it or operate it, <strong>or</strong></li>
          <li>you have explicit, preferably written, permission from its owner to test it.</li>
        </ul>
        <p>
          Before every Security Audit you must confirm this. By ticking the box you make a
          declaration that it is true, and you are solely responsible if it is not.
        </p>
      </LegalSection>

      <LegalSection title="3. Prohibited uses">
        <p>You must not use EsteBot to:</p>
        <ul>
          <li>scan websites, apps or systems you are not authorised to test;</li>
          <li>
            harvest, collect, store or share API keys, passwords, tokens, credentials, personal
            data or any other secrets, from any site;
          </li>
          <li>
            use anything the Service reports to access, or attempt to access, any system, account,
            database or data you are not authorised to access;
          </li>
          <li>carry out reconnaissance for, or as part of, an attack on anyone;</li>
          <li>
            run bulk or automated scans, scrape the Service, or bypass its rate limits or
            safeguards;
          </li>
          <li>probe internal networks or infrastructure through the Service;</li>
          <li>harass, intimidate or extort any person or business with audit results; or</li>
          <li>break any law, or help anyone else do so.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How EsteBot protects others">
        <ul>
          <li>Any secret key it detects is <strong>redacted</strong>, so only a few characters are shown, never the usable value.</li>
          <li>It checks whether sensitive files such as <code>.env</code> are publicly reachable, but <strong>never displays their contents</strong>.</li>
          <li>It does not log in, submit forms, test databases, or try to exploit anything it finds.</li>
          <li>Requests are rate-limited and identify themselves with the <Link href="/bot">EsteBot user agent</Link>.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. If you find something on a site that isn't yours">
        <p>
          Do not use, test or share it. If you believe a site is exposing secrets or data,
          contact its owner privately (many sites list a security contact in{" "}
          <code>/.well-known/security.txt</code>) and give them a chance to fix it.
        </p>
      </LegalSection>

      <LegalSection title="6. Legal responsibility">
        <p>
          Unauthorised access to, or testing of, computer systems is illegal in many countries,
          including under Part 10.7 of the Australian <em>Criminal Code Act 1995</em> (Cth), the
          US <em>Computer Fraud and Abuse Act</em>, and the UK <em>Computer Misuse Act 1990</em>.
          You are solely responsible for making sure your use of EsteBot is lawful where you are
          and where the target website operates.
        </p>
        <p>
          We may block access, rate-limit, or refuse service to anyone we reasonably believe is
          misusing EsteBot, and we will cooperate with lawful requests from law enforcement or
          hosting providers.
        </p>
      </LegalSection>

      <LegalSection title="7. No warranty: this is not a professional audit">
        <ul>
          <li>
            EsteBot runs a limited set of automated checks against the public parts of a website.
            It can miss real problems (false negatives) and flag things that aren&apos;t problems
            (false positives).
          </li>
          <li>
            A good score <strong>does not mean your site is secure</strong> or will rank well. It
            is not a penetration test, code review, compliance assessment, or legal or
            professional advice.
          </li>
          <li>
            &quot;Copy fix prompt&quot; suggestions are general guidance. Review any change before
            you apply it, keep backups, and test thoroughly.
          </li>
          <li>The Service is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          To the maximum extent permitted by law, WozTech is not liable for any loss or damage
          arising from your use of, or reliance on, EsteBot or its results, including lost data,
          revenue or profits, security incidents, or search-ranking changes. Nothing in this policy
          excludes rights you have under the Australian Consumer Law or other laws that cannot be
          excluded.
        </p>
        <p>
          You agree to indemnify WozTech against claims arising from your misuse of the Service or
          your breach of this policy.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes and contact">
        <p>
          We may update this policy at any time; the date at the top shows the latest version.
          Continued use means you accept the changes. This policy is governed by the laws of
          Australia.
        </p>
        <p>
          Questions or abuse reports: contact us via{" "}
          <a href="https://www.woztech.world">woztech.world</a>.
        </p>
      </LegalSection>
    </article>
  )
}
