import type { Metadata } from "next"
import Link from "next/link"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Headcanon Forge — how we collect, use, and protect your data.",
  alternates: { canonical: `${siteUrl}/privacy` },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-16 prose prose-gray">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: June 17, 2026</p>

      <p>
        Headcanon Forge (&quot;we&quot;, &quot;us&quot;) operates{" "}
        <a href={siteUrl}>{siteUrl.replace("https://", "")}</a>. This policy explains what
        data we collect and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Google account info</strong> — When you sign in with Google, we receive your
          Google user ID, email, name, and profile picture. We store this in our database to
          identify your account.
        </li>
        <li>
          <strong>Session data</strong> — We create a session cookie and may store your browser
          user-agent and IP address for security and session management.
        </li>
        <li>
          <strong>Generated content</strong> — Headcanons you create are stored in our database.
          If you opt in to &quot;Share to community Explore&quot;, your generation may be visible
          to other visitors and indexed in our sitemap.
        </li>
        <li>
          <strong>Analytics</strong> — We use privacy-friendly analytics (Plausible) to understand
          site usage. Plausible does not use cookies for tracking in the same way as traditional
          analytics tools.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>Authenticate you and keep you signed in</li>
        <li>Save your headcanon generations</li>
        <li>Display public generations in the community Explore gallery (only when you opt in)</li>
        <li>Improve site reliability and security</li>
      </ul>

      <h2>Data storage</h2>
      <p>
        User and session data are stored in Cloudflare D1 (SQL database). Authentication is handled
        via Google OAuth; we do not receive or store your Google password.
      </p>

      <h2>Data retention</h2>
      <p>
        Sessions expire after 30 days of inactivity. Generated content remains until deleted by us
        or upon request. Contact us to request account or data deletion.
      </p>

      <h2>Third-party services</h2>
      <ul>
        <li>Google OAuth — identity verification</li>
        <li>SiliconFlow API — AI text generation (your prompts are sent to generate content)</li>
        <li>Cloudflare — hosting, database, and CDN</li>
        <li>Plausible Analytics — privacy-friendly traffic statistics</li>
      </ul>

      <h2>Your choices</h2>
      <ul>
        <li>You can sign out at any time to end your session.</li>
        <li>Uncheck &quot;Share to community Explore&quot; before generating to keep content private.</li>
        <li>Email us to request deletion of your account data.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        For privacy questions or data deletion requests, contact:{" "}
        <a href="mailto:quven2014@gmail.com">quven2014@gmail.com</a>
      </p>

      <p>
        <Link href="/">← Back to Home</Link>
      </p>
    </main>
  )
}
