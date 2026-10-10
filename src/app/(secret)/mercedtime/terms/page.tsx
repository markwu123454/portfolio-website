/**
 * MercedTime terms of use — /mercedtime/terms
 *
 * Public at this URL, beside /mercedtime/privacy. Lives in (secret): no site header, styles or
 * nav, and it is not in the sitemap. The text mirrors docs/terms.md in the mercedtime repo;
 * change both together.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: { absolute: 'MercedTime terms of use' },
    description: 'The terms for using the MercedTime Chrome extension.',
    alternates: { canonical: '/mercedtime/terms' },
    openGraph: null,
};

const CSS = `
:root { color-scheme: light dark; --bg: #ffffff; --fg: #1b1f24; --muted: #4b5563; --rule: #e5e7eb; --accent: #0f2e53; --gold: #b8901c; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #0d1117; --fg: #e6e8eb; --muted: #a3acb9; --rule: #2a313c; --accent: #8db4e8; --gold: #d8ac27; }
}
html, body { margin: 0; background: var(--bg); color: var(--fg); }
body { font: 16px/1.7 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
main { max-width: 720px; margin: 0 auto; padding: 56px 20px 80px; }
.brand { font: 700 14px/1 system-ui, sans-serif; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }
.brand span { color: var(--gold); }
h1 { font-size: clamp(30px, 6vw, 40px); line-height: 1.15; margin: 14px 0 6px; }
.updated { color: var(--muted); font-size: 14px; margin: 0 0 32px; padding-bottom: 24px; border-bottom: 1px solid var(--rule); }
h2 { font-size: 20px; line-height: 1.3; margin: 40px 0 8px; }
p, li { color: var(--muted); }
ul { padding-left: 22px; }
li + li { margin-top: 6px; }
a { color: var(--accent); }
`;

export default function MercedTimeTermsPage() {
    return (
        <main>
            <style>{CSS}</style>
            <div className="brand">Merced<span>Time</span></div>
            <h1>Terms of use</h1>
            <p className="updated">Last updated October 10, 2026</p>

            <p>
                MercedTime is provided as is, without warranty of any kind. It is an independent student project, not
                affiliated with UC Merced. You use it at your own risk, and you are responsible for your own registration:
                always confirm your classes in UCM Registration.
            </p>
            <p>
                <a href="/mercedtime/privacy">Privacy policy</a>
            </p>
        </main>
    );
}
