/**
 * MercedTime privacy policy — /mercedtime/privacy
 *
 * Linked from the Chrome Web Store listing, so it must stay public at
 * this URL. Lives in (secret): no site header, styles or nav, and it is
 * not in the sitemap. All styling is the <style> block below.
 * The text mirrors docs/privacy.md in the mercedtime repo; change both together.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: { absolute: 'MercedTime privacy policy' },
    description: 'What the MercedTime Chrome extension reads, what it stores, and what it shares.',
    alternates: { canonical: '/mercedtime/privacy' },
    openGraph: null,
};

const CONTACT = 'mark.wu123454@gmail.com';

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

export default function MercedTimePrivacyPage() {
    return (
        <main>
            <style>{CSS}</style>
            <div className="brand">Merced<span>Time</span></div>
            <h1>Privacy policy</h1>
            <p className="updated">Last updated October 7, 2026 (version 1.0.0)</p>

            <p>
                MercedTime is a Chrome extension for UC Merced students. It is an independent student project and is not
                affiliated with the University of California, Merced.
            </p>

            <h2>What the extension does with data</h2>
            <p>
                The extension reads pages and data from Banner (reg-prod.ec.ucmerced.edu) and uAchieve
                (ucmerced.uachieve.com) using the sign-in you already have in your browser, and shows it to you in its own
                page. It reads your registrations, registration status, course catalog, and degree audit.
            </p>
            <p>MercedTime never sees or stores your password. Sign-in happens on the university’s own pages.</p>

            <h2>Data types handled</h2>
            <ul>
                <li>
                    Personal academic information: your registrations, registration status, degree audit and course
                    history, read from Banner and uAchieve.
                </li>
                <li>Website content: the pages and data returned by reg-prod.ec.ucmerced.edu and ucmerced.uachieve.com.</li>
                <li>
                    Page addresses: the extension sees when the browser opens Banner’s registration menu page or returns
                    from Banner’s sign-in, so it can open MercedTime. Addresses are not saved.
                </li>
            </ul>
            <p>
                The extension shows a disclosure and asks for your agreement the first time it opens. It reads nothing
                from Banner or uAchieve before you agree.
            </p>

            <h2>Notifications</h2>
            <p>
                MercedTime can notify you when a new semester is posted, and a day before and when your registration time
                opens. To do this it checks Banner’s public list of semesters every two hours while Chrome is running, even
                when MercedTime isn’t open. That request does not send your cookies or anything about you. Registration
                reminders are worked out on your computer from the registration time MercedTime last read. You can turn
                notifications off in Settings.
            </p>

            <h2>What is stored</h2>
            <p>
                Your plan and settings, including the courses you watch for open seats, are saved in Chrome’s sync storage
                for the extension. If you are signed in to Chrome with sync turned on, Chrome copies them to your other
                computers through your Google account, the same way it syncs your bookmarks. They go to Google as part of
                Chrome sync, never to the developer. Without Chrome sync they stay on your computer.
            </p>
            <p>The following is saved in your browser’s extension storage on your computer only:</p>
            <ul>
                <li>downloaded course catalogs</li>
                <li>the latest degree audit and course history the extension read</li>
                <li>
                    your latest registrations and registration status, so your schedule still shows when your Banner
                    session has ended
                </li>
                <li>the degree requirements downloaded for the Roadmap</li>
                <li>the list of semesters seen on Banner, and which reminders have already been shown, so none shows twice</li>
                <li>
                    a short log of your last few sign-ins: the addresses of the pages they went through (without anything
                    after the “?”) and whether each check found you signed in, to help fix sign-in problems
                </li>
            </ul>

            <h2>What is shared</h2>
            <p>
                Nothing about you is sent to the developer or to any third party. The only copy that leaves your computer is
                the plan and settings Chrome sync carries for you, as described above. The extension has no analytics, no
                advertising, and no tracking.
            </p>
            <p>
                The Degree page’s Roadmap needs the catalog’s degree requirements. When MercedTime opens, it downloads every
                program’s requirements from a database the developer runs on Neon (neon.tech). The request asks for the
                whole list and carries nothing about you: not your major, courses or name. Like any web request it reveals
                your IP address to Neon. The Roadmap is then worked out on your computer. Data is not sold, not
                transferred, and not used for anything other than showing it to you in the extension.
            </p>

            <h2>Limited Use disclosure</h2>
            <p>
                The use of information received from Banner and uAchieve will adhere to the Chrome Web Store User Data
                Policy, including the Limited Use requirements. The data is used only to provide the extension’s single
                purpose of showing you your catalog, schedule, plan and degree audit. It is not transferred to others,
                except where required by law. It is not used for advertising. No person reads it. Your registrations, degree
                audit and course history never leave your computer.
            </p>

            <h2>Removing your data</h2>
            <p>
                Removing the extension from Chrome deletes the data saved on your computer. To delete the plan and settings
                kept by Chrome sync, use Chrome’s own option to clear synced data. The data in Banner and uAchieve is not
                changed by the extension, except that “Run a new audit” asks uAchieve to run an audit, the same as pressing
                its own button.
            </p>

            <h2>Contact</h2>
            <p>
                <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
            </p>
            <p>
                The bug report and feature request buttons in Settings open an email in your own email app, addressed to
                the developer. Nothing is sent unless you send that email yourself. It includes the extension and Chrome
                version and the semester you were viewing, which you can see and edit before sending.
            </p>
        </main>
    );
}