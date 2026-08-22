/**
 * sprocketstats.com — /work/sprocketstats-com
 *
 * Content is from Mark directly. Do not invent rationale here. If a
 * "why" isn't in that account, leave it out.
 *
 * Naming discipline: this is "sprocketstats.com", never "v2". The scouting
 * app is "SprocketStats Scouting". Both are live and in use.
 *
 * Section 01 prose was drafted by Claude at Mark's explicit request (Aug
 * 2026), from facts already confirmed elsewhere on the site — Mark edited
 * from there. Sections 02-04 are Mark's own account, typo/punctuation
 * cleaned up only, never rephrased.
 *
 * Attribution care:
 *   • RFID was Mark's suggestion in a meeting; a mentor championed it.
 *   • Machine authorization is being specced by the new sophomore and the
 *     mentors, NOT by Mark. Describe it as theirs and as unfinished.
 *   • The subteam is carried day-to-day by the member he recruited as a
 *     freshman; he mentors rather than leads.
 */

import Image from 'next/image';
import type { Metadata } from 'next';
import {
    Page,
    PageHeader,
    Section,
    Crumbs,
    StatStrip,
    Figure,
    Placeholder,
} from '@/app/components/site/primitives';

export const metadata: Metadata = {
    title: 'sprocketstats.com',
    description:
        'The team-facing half of SprocketStats. Attendance, member identity and machine authorization for FRC Team 3473, on top of the scouting data.',
};

export default function SprocketStatsComPage() {
    return (
        <Page>
            <Crumbs
                items={[
                    { href: '/work', label: 'Work' },
                    { href: '/work?domain=Software', label: 'Software' },
                    { label: 'sprocketstats.com' },
                ]}
            />

            <PageHeader
                tag={['PROJECT', 'SOFTWARE', '2024 —']}
                title="sprocketstats.com"
                subtitle="the half that isn't scouting."
                dek="3473 is known as a business team, we took an Impact award and an Engineering Inspiration award in my two years on it, and I think we can become a heavy scouting team too."
            />

            <StatStrip
                items={[
                    { label: 'Status', value: 'Live · in use' },
                    { label: 'Stack', value: 'React · FastAPI · Postgres' },
                    { label: 'Licence', value: 'AGPL-3.0 · self-hostable' },
                    { label: 'Kit', value: '40 tablets · Neon · HumanSignal' },
                ]}
            />

            <Section num="01" title="Why I redid the site">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        The site Sprocket used before this was basically a glorified
                        Google Form: less data, worse analysis, and barely any security.
                        I pulled its scouting and user tables in a few minutes without
                        much effort, so instead of patching it I decided to build a full
                        replacement.
                    </p>
                    <p className="m-0">
                        What replaced it became sprocketstats.com. Sign-in runs through
                        Google OAuth on school email, with the current season&#39;s art
                        and the sponsor credited underneath.
                    </p>
                </div>

                <Figure
                    caption={
                        <>
                            <span className="text-fg-muted">Fig. 1.1 —</span> The old
                            site&#39;s home page, before it was replaced.
                        </>
                    }
                >
                    <div className="bg-bg-elev border border-rule overflow-hidden">
                        <Image
                            src="/sprocket/2025-scoutingapp.png"
                            width={2559}
                            height={1467}
                            alt="Home page of the old scouting site that sprocketstats.com replaced."
                            sizes="(max-width: 880px) 100vw, 1080px"
                            className="w-full h-auto block"
                            priority
                        />
                    </div>
                </Figure>

                <Figure
                    caption={
                        <>
                            <span className="text-fg-muted">Fig. 1.2 —</span> Sign in.
                            School email only, the sponsor credited in product, and the
                            season art behind it.
                        </>
                    }
                >
                    <div className="bg-bg-elev border border-rule overflow-hidden">
                        <Image
                            src="/sprocket/signin.png"
                            width={2559}
                            height={1349}
                            alt="sprocketstats.com sign in page: season artwork and wordmark on the left half, a Continue with Google button on the right, sponsor credit underneath."
                            sizes="(max-width: 880px) 100vw, 1080px"
                            className="w-full h-auto block"
                        />
                    </div>
                </Figure>
            </Section>

            <Section num="02" title="How it grew into team ops">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        The app originally was only intended for scouting, but after a
                        while I noticed that the attendance tracker we use is literally a
                        Google Form, and at the request of the team captain I included
                        attendance into the app. Initially it didn&#39;t go too well
                        because the app would randomly freeze, which I much later found
                        out is because of a leaking database connection.
                    </p>
                </div>
            </Section>

            <Section num="03" title="Auth methods">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        We initially decided to use Google OAuth GIS, because it is one
                        of the simpler ways for members to sign up. After a while we
                        noticed the GIS sign-in button would randomly not load, and the
                        overlay covers around 1/3 the screen on mobile, so we decided to
                        remove it and replace it with the redirect OAuth.
                    </p>
                    <p className="m-0">
                        The redirect OAuth works, but on mobile PWA it flashes the
                        screen, and on both iOS and Android the browser doesn&#39;t offer
                        good UX, so we decided to switch from redirect to popup, which
                        solved most of our issues.
                    </p>
                </div>
            </Section>

            <Section num="04" title="Plans for the future">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        While talking to a teammate about methods to make sure members
                        can&#39;t just sign in from home to accumulate hours, we threw
                        around using RFID or biometric scanning to authenticate, and a
                        mentor walking by liked the idea of using RFID, so a few months
                        later we started planning how to use RFID to check members in
                        and out. The mentor also suggested using RFID to guard against
                        the more dangerous machines we just bought.
                    </p>
                    <p className="m-0">
                        Apart from RFID, if members lost their cards, we also decided to
                        assign each member an 8-digit code they can use instead. The
                        code is designed to support 10k possible combinations, with the
                        rest of the space used as a checksum, so even offline devices
                        can reasonably verify a user&#39;s existence without storing a
                        list of codes.
                    </p>
                </div>
            </Section>
        </Page>
    );
}
