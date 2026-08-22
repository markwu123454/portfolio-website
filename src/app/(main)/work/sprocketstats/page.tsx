import Image from 'next/image';
import type { Metadata } from 'next';
import {
    Page,
    PageHeader,
    Section,
    Crumbs,
    StatStrip,
    Tag,
    StatusPill,
    Figure,
    FigurePlaceholder,
    TOCLayout,
} from '@/app/components/site/primitives';

export const metadata: Metadata = {
    title: 'SprocketStats Scouting',
    description:
        'A full-stack scouting platform for FRC. Ensemble prediction, field-mapped input, and a guest sharing system that turns scouted data into a team-facing tool.',
};

const TOC = [
    { id: 's01', num: '01', label: 'Why it exists' },
    { id: 's02', num: '02', label: 'The scouting app' },
    { id: 's03', num: '03', label: 'Analysis + prediction' },
    { id: 's04', num: '04', label: 'Data presentation' },
    { id: 's05', num: '05', label: 'Homography' },
    { id: 's06', num: '06', label: 'Broadcast alignment' },
    { id: 's07', num: '07', label: 'YOLO + ByteTrack' },
    { id: 's08', num: '08', label: 'HRNet keypoints' },
    { id: 's09', num: '09', label: 'RNN' },
] as const;

function PartDivider({ label }: { label: string }) {
    return (
        <div className="pt-16 max-[880px]:pt-12 border-t border-rule-strong">
            <div className="font-mono text-[11px] tracking-kicker uppercase text-accent mt-6">
                {label}
            </div>
        </div>
    );
}

export default function SprocketStatsPage() {
    return (
        <Page>
            <Crumbs
                items={[
                    { href: '/work', label: 'Work' },
                    { href: '/work?domain=Software', label: 'Software' },
                    { label: 'SprocketStats Scouting' },
                ]}
            />

            <PageHeader
                tag={['PROJECT', 'SOFTWARE', '2024 —']}
                title="SprocketStats Scouting"
                dek="The scouting side of SprocketStats."
            />

            <StatStrip
                items={[
                    { label: 'Status', value: 'Live · in use' },
                    { label: 'Team', value: 'Sprocket scouting subteam' },
                    { label: 'Scouted', value: '411 records · 73 teams · 3 events' },
                    { label: 'Accuracy', value: '~87% win/loss prediction' },
                ]}
            />

            <div className="flex flex-wrap gap-1.5 mt-6" aria-label="Tech stack">
                {['React', 'TypeScript', 'Tailwind', 'FastAPI', 'Tauri', 'Python'].map((t) => (
                    <Tag key={t} variant="outline">{t}</Tag>
                ))}
            </div>

            <TOCLayout toc={TOC}>
                <PartDivider label="2025" />

                <Section num="01" id="s01" title="Why it exists">
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4 mt-6">
                        <p className="m-0">
                            During the 2025 season Sprocket was using an older scouting app,
                            effectively a glorified Google Form. It collected less data, was
                            harder to use, had worse analysis, and the security was so bad I was able to download the scouting data unauthenticated without much effort.
                            That app is now taken down.
                        </p>
                        <p className="m-0">
                            Over the summer I decided to create my own scouting appto replace it. The core goal
                            was better data collection, better data quality, and tighter
                            integration across the entire scouting workflow, from getting event
                            data, to match scouting, pit scouting, analysis, presentation, and
                            sharing, not just more of the same.
                        </p>
                    </div>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 1.1: </span> The old
                                scouting app, taken down after this project replaced it.
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/Screenshot 2026-08-13 205523.png"
                                width={837}
                                height={815}
                                alt="Screenshot of the old 2025 scouting app that SprocketStats replaced."
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>
                </Section>

                <PartDivider label="2026" />

                <Section num="02" id="s02" title="The scouting app">
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4 mt-6">
                        <p className="m-0">
                            Built for FRC <em className="text-fg-muted italic">Reefscape</em> (2025) and
                            updated for <em className="text-fg-muted italic">Rebuilt</em> (2026). In 2026
                            the main UX challenge was shot volume: robots in this game shoot at very
                            high throughput, so the original +1 / +2 / +5 / +10 button approach was
                            replaced with a slider scouters can drag or click rapidly. The app also
                            includes a field illustration where scouters input shooting location and
                            activate task buttons (defense, traversal, shooting, intaking, and so on).
                            Drew inspiration from <em className="text-fg-muted italic">Lovat</em>, the
                            scouting app developed by FRC team 8033.
                        </p>
                    </div>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 2.1:</span> Current scouting
                                app, second event of the 2026 season. Field illustration on the
                                right; task panel and shot slider on the left.
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/Screenshot 2026-05-10 075229.png"
                                width={2559}
                                height={1599}
                                alt="Current scouting app, second event of the 2026 season — task panel and shot slider on the left, field illustration on the right."
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 2.2: </span> Earlier full-app
                                design (left) and the shot-volume slider in close-up (right). The
                                slider replaced four discrete +N buttons after testing showed shot
                                rates that broke the button-tapping model.
                            </>
                        }
                    >
                        <div className="grid grid-cols-[1.65fr_1fr] gap-4 items-stretch max-[720px]:grid-cols-1">
                            <div className="bg-bg-elev border border-rule overflow-hidden flex">
                                <Image
                                    src="/sprocket/Screenshot 2026-04-03 205309.png"
                                    width={985}
                                    height={487}
                                    alt="Earlier full-app design, with the original +N button approach for shot counting."
                                    sizes="(max-width: 720px) 100vw, 600px"
                                    className="w-full h-auto self-center"
                                />
                            </div>
                            <div className="bg-bg-elev border border-rule overflow-hidden flex">
                                <Image
                                    src="/sprocket/img.png"
                                    width={503}
                                    height={898}
                                    alt="Close-up of the shot-volume slider that replaced the +N buttons."
                                    sizes="(max-width: 720px) 100vw, 360px"
                                    className="w-full h-auto self-center"
                                />
                            </div>
                        </div>
                    </Figure>

                    <div className="border-l-2 border-accent bg-accent-soft px-4.5 py-3.5 mt-6">
                        <div className="font-mono text-[10.5px] tracking-kicker uppercase text-accent mb-1">
                            UX change · between events
                        </div>
                        <p className="m-0 text-[14.5px] leading-[1.6] text-fg">
                            Task buttons changed from <em className="italic">click-to-activate</em> to{' '}
                            <em className="italic">hold-to-activate</em>, removing one interaction per
                            state, less physical and mental load on scouters across an event
                            day.
                        </p>
                    </div>
                </Section>

                <Section num="03" id="s03" title="Analysis + prediction">
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            An ensemble algorithm with roughly 15 output parameters
                            across match result, alliance performance, and robot performance. Each data source,
                            including Statbotics, match scouting data, pit scouting data, and so on, is
                            weighted by how accurately it predicts past matches, then aggregated.
                        </p>
                        <p className="m-0">
                            Win/loss prediction accuracy: <strong className="text-fg font-semibold">~87%</strong> across
                            roughly 90 late-qualification and playoff matches. A two-proportion
                            significance test against the Statbotics EPA baseline over the same set
                            found no statistically significant difference at 95% confidence,
                            statistically indistinguishable from EPA.
                        </p>
                    </div>
                </Section>

                <Section num="04" id="s04" title="Data presentation">
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            Presentation lives inside the same app. A guest system lets a
                            scouter share a passcode or QR code with alliance partners or future
                            teammates so they get read-only access to the relevant slice of data
                            without an account.
                        </p>
                        <p className="m-0">
                            Pages include per-team profiles, past match reviews, future match
                            previews, full robot rankings, and an alliance selection simulator{' '}
                            <em className="text-fg-muted italic">(in progress).</em>
                        </p>
                    </div>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 4.1: </span> Match review
                                screen from the data-presentation side of the app. Per-match
                                breakdown of scouted task counts and contributions.
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/scouting_2026.png"
                                width={1919}
                                height={914}
                                alt="Match review screen from the data-presentation side of the app."
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>
                </Section>

                <PartDivider label="2027" />

                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4 mt-6">
                    <p className="m-0">
                        v3 is a new scouting pipeline aimed at collecting more data automatically instead of asking a person to watch a match and tap
                        buttons. It is currently under active development to prepare for 2026 off season and 2027, it&#39;s not yet deployed or tested.
                    </p>
                </div>

                <Section num="05" id="s05" title="Homography">
                    <div className="flex items-center gap-2 mb-4">
                        <StatusPill tone="warn">In development</StatusPill>
                    </div>
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            What homography tries to solve is given a camera, find where the
                            field is, so in the future everything done on the pixels can map to
                            the field. We use AprilTags to detect the locations of the field,
                            and by referencing the official AprilTag layout we can solve for
                            camera intrinsics, then solve for the position of the camera
                            relative to the field.
                        </p>
                    </div>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 5.1: </span> AprilTags
                                detected in webcast footage, used to solve for the field
                                position.
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/v3/webcast-apriltags.png"
                                width={1934}
                                height={720}
                                alt="AprilTags detected in webcast footage, used to solve for the field position."
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 5.2: </span> Camera solve
                                across multiple broadcast angles.
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/v3/multi-camera-solve.png"
                                width={1168}
                                height={615}
                                alt="Camera solve across multiple broadcast angles, mapped into a shared field coordinate system."
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>
                </Section>

                <Section num="06" id="s06" title="Broadcast alignment">
                    <div className="flex items-center gap-2 mb-4">
                        <StatusPill tone="warn">In development</StatusPill>
                    </div>
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            Broadcast is used to capture information from the webcast specific
                            data, like scoring events on the overlay, and audio cues, we use a
                            template matching algorithm to read the letters with higher accuracy
                            than naive OCR, and we use the combination of clock and audio cues
                            to determine match start and end time.
                        </p>
                    </div>
                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 6.1: </span> View splitting within frame to separate each camera for separate processing.
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/v3/img_1.png"
                                width={1920}
                                height={1080}
                                alt="View splitting within frame to separate each camera for separate processing."
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 6.2: </span> Template matching debug view, used to test letter-reading accuracy against the webcast overlay
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/v3/img_2.png"
                                width={678}
                                height={558}
                                alt="Template matching debug view, used to test letter-reading accuracy against the webcast overlay"
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>
                </Section>

                <Section num="07" id="s07" title="YOLO + ByteTrack">
                    <div className="flex items-center gap-2 mb-4">
                        <StatusPill tone="neutral">Earlier stage</StatusPill>
                    </div>
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            YOLO is used to identify the existence of robots and track them,
                            since YOLO only need to see parts of the robot and there&#39;s
                            better tracking algorithms, it&#39;s harder to lose a robot, so we
                            use YOLO to ID the robots, then use HRNet to pinpoint the location
                            of the robots instead of estimating.
                        </p>
                    </div>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 7.1: </span> YOLO +
                                ByteTrack robot detection and tracking on competition footage.
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/img_1.png"
                                width={2879}
                                height={1799}
                                alt="YOLO + ByteTrack robot detection and tracking on competition footage."
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>
                </Section>

                <Section num="08" id="s08" title="HRNet keypoints">
                    <div className="flex items-center gap-2 mb-4">
                        <StatusPill tone="warn">In development</StatusPill>
                    </div>
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            HRNet is used to identify the location of robots on the field, we
                            labeled keypoints and trained a heatmap model to output where
                            robots are on screen, and combined with YOLO and homography can
                            output where robots are.
                        </p>
                    </div>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 8.1: </span> HRNet keypoint
                                output on competition footage.
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/v3/img.png"
                                width={1620}
                                height={906}
                                alt="HRNet keypoint output on competition footage."
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>

                    <Figure
                        caption={
                            <>
                                <span className="text-fg-muted">Fig. 8.2: </span> Robot
                                positions from HRNet output, transformed onto field coordinates.
                            </>
                        }
                    >
                        <div className="bg-bg-elev border border-rule overflow-hidden">
                            <Image
                                src="/sprocket/v3/field-trajectories.png"
                                width={1086}
                                height={594}
                                alt="Robot positions from HRNet output, transformed onto field coordinates."
                                sizes="(max-width: 880px) 100vw, 1080px"
                                className="w-full h-auto block"
                            />
                        </div>
                    </Figure>
                </Section>

                <Section num="09" id="s09" title="RNN">
                    <div className="flex items-center gap-2 mb-4">
                        <StatusPill tone="neutral">Earlier stage</StatusPill>
                    </div>
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            RNN is currently not finished, but it&#39;ll take the output robot
                            tracks, and do frame categorization and scoring event correlation to
                            output a robot&#39;s behavior during a match.
                        </p>
                    </div>
                </Section>
            </TOCLayout>
        </Page>
    );
}
