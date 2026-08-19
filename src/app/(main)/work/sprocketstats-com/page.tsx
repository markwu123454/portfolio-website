/**
 * sprocketstats.com — /work/sprocketstats-com
 *
 * Content is from Mark directly (Aug 2026 interview). Do not invent
 * rationale here. If a "why" isn't in that account, leave it out.
 *
 * Naming discipline: this is "sprocketstats.com", never "v2". The scouting
 * app is "SprocketStats Scouting". Both are live and in use.
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
    ArrowLink,
    Figure,
} from '@/app/components/site/primitives';

const IMG = {
    signin: { src: '/sprocket/signin.png', w: 2559, h: 1349 },
} as const;

export const metadata: Metadata = {
    title: 'sprocketstats.com',
    description:
        'The team-facing half of SprocketStats. Attendance, member identity and machine authorization for FRC Team 3473, on top of the scouting data.',
};

const AUTH: Array<[string, string]> = [
    [
        'Google OAuth',
        'School email, on the older OAuth redirect flow rather than the newer GIS. That’s a story of its own.',
    ],
    [
        'RFID card',
        'The everyday path, and the one currently being built out. Doubles as the thing you can show off to other teams at a competition.',
    ],
    [
        '8-digit code',
        'For anyone who forgets or loses a card. Checksummed, which also makes it the offline path during scouting.',
    ],
];

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
                dek="3473 is known as a business team, we took an Impact award and an Engineering Inspiration award in my two years on it, and I think we can be a heavy scouting team too. The app kept covering more, so it started picking up team operations as well."
            />

            <StatStrip
                items={[
                    { label: 'Status', value: 'Live · in use' },
                    { label: 'Stack', value: 'React · FastAPI · Postgres' },
                    { label: 'Licence', value: 'AGPL-3.0 · self-hostable' },
                    { label: 'Kit', value: '40 tablets · Neon · HumanSignal' },
                ]}
            />

            <Section num="01" title="Why a scouting app is doing attendance">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        Since the app covers more and more, we talked with our operations
                        subteam on the business side, and they have no objections with us
                        taking over some team operations stuff.
                    </p>
                    <p className="m-0">
                        We were working out how to authenticate members and what a decent
                        check-in / check-out attendance system would look like. I threw out
                        RFID, or biosignal checking, fairly casually. One of the mentors
                        really liked the RFID idea, and that&#39;s why we&#39;re doing it.
                    </p>
                </div>

                <Figure
                    caption={
                        <>
                            <span className="text-fg-muted">Fig. 1.1 —</span> Sign in. School
                            email only, the sponsor credited in product, and the season art
                            behind it.
                        </>
                    }
                >
                    <div className="bg-bg-elev border border-rule overflow-hidden">
                        <Image
                            src={IMG.signin.src}
                            width={IMG.signin.w}
                            height={IMG.signin.h}
                            alt="sprocketstats.com sign in page: season artwork and wordmark on the left half, a Continue with Google button on the right, sponsor credit underneath."
                            sizes="(max-width: 880px) 100vw, 1080px"
                            className="w-full h-auto block"
                            priority
                        />
                    </div>
                </Figure>
            </Section>

            <Section num="02" title="Three ways in">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        There will be three authorisation paths, each covering a case the
                        others don&#39;t:
                    </p>
                </div>

                <dl className="m-0 mt-2">
                    {AUTH.map(([k, v]) => (
                        <div
                            key={k}
                            className="grid grid-cols-1 sm:grid-cols-[140px_minmax(0,1fr)] gap-2 sm:gap-6 py-4 border-t border-rule"
                        >
                            <dt className="font-mono text-[11px] tracking-mono text-fg-soft sm:pt-1">
                                {k}
                            </dt>
                            <dd className="m-0 text-[14.5px] leading-[1.6] text-fg-muted max-w-160">
                                {v}
                            </dd>
                        </div>
                    ))}
                </dl>
            </Section>

            <Section num="03" title="Why eight digits">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        I wanted at least one digit of error distance and at least ten
                        thousand unique codes, so it settled at eight digits with three of
                        them checksum, and I implemented the algorithm in both Rust and SQL.
                        The error distance is less about someone mistyping and more about
                        stopping people guessing valid codes at random.
                    </p>
                    <p className="m-0">
                        The reason it exists at all is offline scouting. A kiosk out at an
                        event has no business holding a copy of the user table, so it
                        doesn&#39;t: it verifies the checksum, concludes it is fairly certain
                        this is a real person, and accepts the entry. The actual user
                        verification happens on the server when that entry is uploaded.
                        Nothing from the database is sitting on the tablet to leak in the
                        first place.
                    </p>
                    <p className="m-0">
                        The kiosk is a locked-down desktop app for the same reason. The
                        single worst thing about the old scouting site was its security. I
                        pulled its scouting and user tables in a few minutes, so I&#39;d
                        rather overdo this than repeat it.
                    </p>
                </div>
            </Section>

            <Section num="04" title="Machine authorization">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        This one isn&#39;t mine. The new sophomore and the mentors are
                        working out the details, and what I&#39;m hearing is a tablet with a
                        scanner next to each machine, with the site tracking who was on which
                        machine and for how long.
                    </p>
                    <p className="m-0">
                        It matters more than it used to because the shop is getting more
                        serious equipment, a 5 axis and I think a digital lathe, where
                        training and authorisation stop being paperwork. One RFID card ends
                        up covering attendance, machine authorisation, and the show-off
                        factor at competitions.
                    </p>
                </div>
            </Section>

            <Section num="05" title="It reskins for the season">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        The site is heavily themed around the current game. Once you sign in
                        there&#39;s a setting to switch it back to 2026 or 2025, Rebuilt and
                        Reefscape, and that swaps the background art, the wordmark and the
                        whole colour scheme, not just an accent.
                    </p>
                </div>
            </Section>

            <Section num="06" title="AGPL, and why bother">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        There are a lot of FRC scouting apps. There are not many that also do
                        team operations, and not many working toward automatic scouting, so
                        there&#39;s room to be useful to the wider ecosystem. I don&#39;t
                        really expect another team to pick it up yet, but this is where you
                        start if you want that to ever happen. A fair number of companies
                        also require open source before they&#39;ll sponsor you, so it keeps
                        that door open.
                    </p>
                    <p className="m-0">
                        I&#39;m an alumnus now. The member I recruited as a freshman carries
                        the subteam day to day; I still write the harder features and mentor.
                        The <ArrowLink href="/work/sprocketstats">scouting app</ArrowLink> is
                        the other half of this.
                    </p>
                </div>
            </Section>
        </Page>
    );
}
