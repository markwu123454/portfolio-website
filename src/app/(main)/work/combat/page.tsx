/**
 * Team Infernope — /work/combat
 *
 * Real robot data ported from the pre-redesign page.
 * Hazard theme (amber + red). Stripe at top and bottom.
 *
 * Images still reference /infernope/... paths from the original.
 * Images are in /public/infernope/.
 *
 * Robot roster (real, from original page):
 *   Y1:          Horizontal Spinner
 *   Between 1–2: Experimental Shell Spinners (CAD only)
 *   Y2:          Thwack!
 *   Between 2–3: Doomstone, Vert
 *   Y3 Sem 1:    300g Bot, 90 Degrees
 *   Y3 Sem 2:    Good Game (1st), MAD (2nd), Hello Kitty (3rd),
 *                The Reynolds Pamphlet (4th), One and Two (6th),
 *                Riptide (CAD only)
 *   After Y3:    OP (practice build, never competed)
 */

import {
    Section,
    Tag,
    Crumbs,
    StatStrip,
} from '../../components/site/primitives';
import {Metadata} from "next";
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Team Infernope',
    description:
        'Three years of combat robotics. Twelve robots, real lessons, one end-of-year tournament win.',
};

export default function CombatPage() {
    return (
        <div data-theme="hazard">
            <div className="hazard-stripe" />

            <main className="max-w-[1100px] mx-auto px-8 pb-12">
                <div className="pt-12">
                    <Crumbs
                        items={[
                            { href: '/work', label: 'Work' },
                            { label: 'Team Infernope' },
                        ]}
                    />

                    <div className="font-mono text-[11px] tracking-kicker uppercase text-accent mb-4 flex items-center gap-2">
                        <span>ARCHIVE</span>
                        <span className="text-fg-soft">·</span>
                        <span>3 YEARS</span>
                        <span className="text-fg-soft">·</span>
                        <span>12 ROBOTS</span>
                    </div>

                    <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-12 items-start mb-10">
                        <h1 className="m-0 font-mono uppercase font-semibold leading-[1.05] tracking-[0] text-[clamp(36px,4.5vw,52px)] max-w-[760px]">
                            Team Infernope —{' '}
                            <br />
                            three years, twelve robots.
                        </h1>

                        <div>
                            <p className="m-0 mb-4 text-[15.5px] leading-[1.65] text-fg-muted max-w-[420px]">
                                Combat robotics, 1lb and 3lb classes. Run by Mark
                                Duffield. Each robot was a deliberate step —
                                voltage scaling, modular chassis, energy efficiency.
                                End-of-year tournament: first place. The team is closed.
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                <Tag>1lb · 3lb</Tag>
                                <Tag>Year 1 — Year 3</Tag>
                                <a
                                    href="https://teaminfernope.wordpress.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-sm border border-rule font-mono text-[11px] tracking-mono text-fg-muted hover:text-accent transition-colors"
                                >
                                    Legacy site ↗
                                </a>
                                <a
                                    href="https://www.youtube.com/@TeamInfernope/featured"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-sm border border-rule font-mono text-[11px] tracking-mono text-fg-muted hover:text-accent transition-colors"
                                >
                                    YouTube ↗
                                </a>
                            </div>
                        </div>
                    </div>

                    <StatStrip
                        cols={4}
                        items={[
                            { label: 'Robots built', value: '12'           },
                            { label: 'Classes',      value: '300g(feather weight) + 1lb(ant weight) + 3lb(beetle weight)'    },
                            { label: 'Best result',  value: '1st — EOY Y3' },
                            { label: 'Duration',     value: '3 years'      },
                        ]}
                    />
                </div>

                <Section num="Y1" title="Year 1">
                    <RobotEntry
                        title="Horizontal Spinner"
                        type="Horizontal Spinner"
                        result="Non-functional"
                        description="The first attempt at a combat robot. Never operated successfully — marked the start of experimentation with chassis and drive systems."
                        failed={['No functional drivetrain or weapon.', 'Lacked understanding of assembly fundamentals.']}
                        learned={['Use proper fasteners and alignments.', 'Begin testing small subsystems before full assembly.']}
                    />
                </Section>

                <Section num="—" title="Between Year 1 and Year 2">
                    <RobotEntry
                        title="Experimental Shell Spinners"
                        type="Shell Spinner (CAD only)"
                        result="CAD practice — not built"
                        description="Concept CADs of shell spinners developed between Year 1 and 2, focusing on rotational stability and 3D printing feasibility. None completed due to impractical manufacturing constraints."
                        failed={['None were completed due to impractical manufacturing constraints.']}
                        learned={['Part balancing and assembly alignment in Fusion 360 and TinkerCAD.']}
                    />
                </Section>

                <Section num="Y2" title="Year 2">
                    <RobotEntry
                        title="Thwack!"
                        type="Thwack Bot"
                        result="1–0–2 at end-of-year double elim."
                        description="A simple thwack bot with interchangeable attachments designed for impact-based defense."
                        failed={['No active weapon.', 'Incorrect gear ratio made drive too slow for effective hits.']}
                        learned={['Designing 3D-printed wheel hubs with strong mounting interfaces and high traction.', 'Basic modular design.']}
                    />
                </Section>

                <Section num="—" title="Between Year 2 and Year 3">
                    <RobotEntry
                        title="Doomstone"
                        type="Horizontal Bar Spinner"
                        result="Practice build"
                        description="A heavy horizontal bar spinner optimized for kinetic impact. The first fully functional robot with an active weapon."
                        failed={['Slow weapon spin-up due to power limits.']}
                        learned={['Always test electrical systems individually to prevent damage from miswiring.']}
                    />
                    <RobotEntry
                        title="Vert"
                        type="Dual-Disk Vertical Spinner"
                        result="Practice build"
                        description="A large double disk vertical spinner, emphasizing upward impact and wedge-driven control."
                        failed={['Hard to balance.', '3D printing defects caused inconsistent wedge performance.']}
                        learned={['CG calculations and optimization in Fusion 360.']}
                    />
                </Section>

                <Section num="Y3.1" title="Year 3 — Semester 1">
                    <RobotEntry
                        title="300g Bot"
                        type="Vertical Beater Bar (300g)"
                        result="Eliminated at quals"
                        description="A 300g beater bar bot designed for the lower weight class while maintaining offensive capability. Strong design, unlucky bracket placement."
                        failed={['Strong design but unlucky tournament placement.']}
                        learned={['Pocketing chassis and 3D printing techniques reducing print weight', 'Uses weapon vortex for cooling electronics.']}
                    />
                    <RobotEntry
                        title="Right Angle"
                        type="Bristledrive Horizontal Disk Spinner (300g)"
                        result="Eliminated at round of 32"
                        description="A bristle-drive horizontal spinner without wheels, relying on vibrations for movement. Exploited the 1.5x weight bonus for a heavier weapon."
                        failed={['Extremely slow and hard to control.', 'Excessive vibration caused instability.']}
                        learned={['Vibration damping and energy absorption in chassis design.']}
                    />
                </Section>

                <Section num="Y3.2" title="Year 3 — Semester 2">
                    <RobotEntry
                        title="Good Game"
                        type="Vertical Disk / Bar Spinner"
                        result="1st place — End-of-Year Tournament"
                        highlight
                        description="Flagship vertical disk spinner with swappable wheels, weapons, wheel guard, and wedge configuration for opponent-specific optimization."
                        failed={['Underestimated weapon forces led to broken bolts and bearings.', 'High energy output in weapon and drive caused 3D printed parts to melt and fuse with each other']}
                        learned={['Modular design(playing the configuration game).', 'Belt driven weapon to protect weapon from direct hits.']}
                    />
                    <RobotEntry
                        title="MAD"
                        type="Horizontal Bar Spinner"
                        result="2nd place — End-of-Year Tournament"
                        description="An upgraded horizontal spinner running a 6S system instead of 3S, doubling voltage for higher energy output."
                        failed={['Faulty belt system limited weapon to 30% power.']}
                        learned={['Multi-voltage integration: 12V drive and 24V weapon systems.']}
                    />
                    <RobotEntry
                        title="Hello Kitty"
                        type="Drum Spinner"
                        result="3rd place — End-of-Year Tournament"
                        description="A small egg-beater robot built in 3 days for a rapid design challenge."
                        failed={['Weapon spun in the wrong direction initially.', 'Later failed due to incorrect print orientation.']}
                        learned={['Designing under time constraints without prototype testing.']}
                    />
                    <RobotEntry
                        title="The Reynolds Pamphlet"
                        type="Hammer Bot"
                        result="4th place — End-of-Year Tournament"
                        description="A hammer bot using a torsion spring and sector gear for automatic release. Focused equally on aesthetics and function."
                        failed={['Torsion spring too weak, causing low strike energy.']}
                        learned={['Brushed DC motor weapon control and integrated gearbox packaging.']}
                    />
                    <RobotEntry
                        title="One and Two"
                        type="Multibot Wedge"
                        result="6th place — End-of-Year Tournament"
                        description="Two smaller 225g wedge robots in a multi-bot configuration."
                        failed={['No active weapon.']}
                        learned={['Designing multiple independent systems.']}
                    />
                    <RobotEntry
                        title="Riptide"
                        type="Egg Beater (3lb) — CAD only"
                        result="Not built"
                        description="A 3lb egg-beater inspired by Riptide (BattleBots) and Ares (NHRL). Never manufactured due to time constraints."
                        failed={['Never manufactured due to time constraints.']}
                        learned={['First robot fully designed in Fusion 360 using mixed materials: UHMW and carbon fiber.']}
                    />
                </Section>

                <Section num="POST" title="After Year 3">
                    <RobotEntry
                        title="OP"
                        type="Vertical Disk Spinner"
                        result="Practice build — never competed"
                        description="A final post-transfer project. Optimized for rotational inertia, storing 200+J of kinetic energy in the weapon. Gyroscopic forces effectively prevent turning at >50% weapon speed."
                        failed={['Never competed.', 'Gyroscopic forces hinders turning at >50% weapon speed.']}
                        learned={['Hub motors for drive and rubber band-linked 4WD system.']}
                    />
                </Section>
            </main>

            <div className="hazard-stripe mt-12" />
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════
   ROBOT ENTRY
   ═════════════════════════════════════════════════════════════════ */

const ROBOT_IMAGES: Record<string, string[]> = {
    'Horizontal Spinner': ['/infernope/Screenshot 2025-10-27 201510.png'],
    'Experimental Shell Spinners': ['/infernope/Screenshot 2025-10-27 210335.png', '/infernope/Screenshot 2025-10-27 205318.png'],
    'Thwack!': ['/infernope/Screenshot 2025-10-27 220111.png', '/infernope/Screenshot 2025-10-27 220153.png'],
    'Doomstone': ['/infernope/Screenshot 2025-10-27 215736.png'],
    'Vert': ['/infernope/Screenshot 2025-10-27 205543.png'],
    '300g Bot': ['/infernope/Screenshot 2025-10-27 202823.png', '/infernope/Screenshot 2025-10-27 222440.png'],
    'Right Angle': ['/infernope/Screenshot 2025-10-27 202504.png'],
    'Good Game': ['/infernope/Screenshot 2025-10-27 221114.png', '/infernope/Screenshot 2025-10-27 221553.png', '/infernope/Weixin Image_20251027221936_84_27.jpg', '/infernope/Weixin Image_20251027221938_85_27.jpg'],
    'MAD': ['/infernope/Screenshot 2025-10-27 215322.png', '/infernope/Weixin Image_20251027221940_87_27.jpg', '/infernope/Screenshot 2025-10-27 222312.png', '/infernope/Screenshot 2025-10-27 215647.png'],
    'Hello Kitty': ['/infernope/Screenshot 2025-10-27 220835.png'],
    'The Reynolds Pamphlet': ['/infernope/Screenshot 2025-10-27 220655.png'],
    'One and Two': ['/infernope/Screenshot 2025-10-28 124532.png'],
    'Riptide': ['/infernope/Screenshot 2025-10-27 223235.png'],
    'OP': ['/infernope/Screenshot 2025-10-27 203121.png', '/infernope/img.png'],
};


function RobotImages({ title, images }: { title: string; images: string[] }) {
    if (images.length === 0) return null;
    const gridCols = images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';
    return (
        <div className={`grid gap-3 mb-5 ${gridCols} ${images.length === 1 ? 'max-w-md' : ''}`}>
            {images.map((src, i) => (
                <div key={i} className="overflow-hidden rounded-md border border-rule bg-bg-elev">
                    <Image
                        src={src}
                        alt={`${title} ${images.length > 1 ? i + 1 : ''}`}
                        className="w-full h-auto object-contain"
                        loading="lazy"
                    />
                </div>
            ))}
        </div>
    );
}

interface RobotEntryProps {
    title: string;
    type: string;
    result: string;
    highlight?: boolean;
    description: string;
    failed: string[];
    learned: string[];
}

function RobotEntry({ title, type, result, highlight, description, failed, learned }: RobotEntryProps) {
    return (
        <div className={`mb-8 border rounded-md overflow-hidden ${highlight ? 'border-accent' : 'border-rule'}`}>
            <div className={`flex items-baseline justify-between gap-4 px-4 py-2.5 border-b ${highlight ? 'border-accent bg-accent-soft' : 'border-rule bg-bg-elev'}`}>
                <span className="font-mono text-[11px] tracking-kicker uppercase text-fg-soft">
                    {type}
                </span>
                <span className={`font-mono text-[11px] tracking-mono whitespace-nowrap ${highlight ? 'text-accent font-semibold' : 'text-fg-soft'}`}>
                    {result}
                </span>
            </div>

            <div className="p-5">
                <h3 className="m-0 mb-2 text-[18px] font-semibold tracking-[-0.01em]">
                    {title}
                </h3>
                <p className="m-0 mb-5 text-[14.5px] leading-[1.65] text-fg-muted max-w-[640px]">
                    {description}
                </p>

                <RobotImages title={title} images={ROBOT_IMAGES[title] ?? []} />

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                    <StencilCol label="FAILED" tone="red" items={failed} />
                    <StencilCol label="LEARNED" tone="amber" items={learned} />
                </div>
            </div>
        </div>
    );
}

function StencilCol({ label, tone, items }: { label: string; tone: 'red' | 'amber'; items: string[] }) {
    const color = tone === 'red' ? 'text-accent-2' : 'text-accent';
    return (
        <div>
            <div className={`font-mono text-[10px] tracking-kicker uppercase ${color} mb-2 pb-1.5 border-b border-rule`}>
                {label}
            </div>
            <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                {items.map((it, i) => (
                    <li key={i} className="flex items-baseline gap-2 text-[13.5px] text-fg-muted leading-[1.5]">
                        <span aria-hidden className="text-fg-soft font-mono text-[11px] shrink-0">—</span>
                        {it}
                    </li>
                ))}
            </ul>
        </div>
    );
}