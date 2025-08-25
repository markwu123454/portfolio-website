// app/contact/page.tsx
import {Mail, Github, ArrowUpRight} from "lucide-react";

export default function ContactPage() {
    return (
        <main className="relative min-h-[calc(100vh-209px)] overflow-hidden bg-black text-white mt-24">
            {/* --- Neon atmospherics / scanlines / grid --- */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                {/* soft glows */}
                <div className="absolute -top-40 -left-40 h-[42rem] w-[42rem] rounded-full bg-cyan-500/20 blur-3xl"/>
                <div
                    className="absolute -bottom-40 -right-40 h-[42rem] w-[42rem] rounded-full bg-fuchsia-500/20 blur-3xl"/>
                {/* vignette + radial grain */}
                <div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]"/>
                <div className="absolute inset-0 bg-[linear-gradient(transparent,rgba(0,0,0,0.7))]"/>
                {/* faint grid */}
                <div
                    className="absolute inset-0 opacity-[0.12] [background:linear-gradient(transparent,transparent_31px,rgba(255,255,255,.20)_32px),linear-gradient(90deg,transparent,transparent_31px,rgba(255,255,255,.20)_32px)] [background-size:32px_32px]"/>
                {/* scanlines */}
                <div
                    className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.6)_0,rgba(255,255,255,.6)_1px,transparent_2px,transparent_3px)]"/>
            </div>

            <section className="px-6 pt-24">
                <div className="mx-auto max-w-3xl">
                    <header className="mb-10 text-center">
                        <div
                            className="mx-auto mb-4 h-10 w-10 rounded-xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 flex items-center justify-center">
                            {/* tiny neon accent bar */}
                            <span className="relative block h-3 w-3 rounded-[4px] bg-cyan-400">
                <span className="absolute inset-0 rounded-[4px] blur-[6px] bg-cyan-400/70"/>
                </span>
                        </div>
                        <h1 className="text-4xl font-semibold tracking-tight">Let’s Connect</h1>
                        <p className="mt-2 text-zinc-400">
                            Collaborations, projects, or a quick chat.
                        </p>
                    </header>

                    {/* Card Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <ContactCard
                            href="mailto:me@markwu.org"
                            title="Email"
                            subtitle="Send me a direct email"
                            Icon={Mail}
                            accent="from-cyan-400 via-teal-300 to-emerald-300"
                        />
                        <ContactCard
                            href="https://github.com/markwu123454"
                            title="GitHub"
                            subtitle="Explore my code and projects"
                            Icon={Github}
                            external
                            accent="from-fuchsia-400 via-violet-400 to-cyan-400"
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

/** Glassmorphism + neon cyberpunk card */
function ContactCard({
                         href,
                         title,
                         subtitle,
                         Icon,
                         external,
                         accent, // gradient classes
                     }: {
    href: string;
    title: string;
    subtitle: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    external?: boolean;
    accent: string;
}) {
    return (
        <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={[
                // base glass card
                "group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl",
                "border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md",
                // subtle edges + hover glow
                "shadow-[0_0_0_1px_rgba(255,255,255,.04)] transition",
                "hover:bg-white/[0.06] hover:shadow-[0_0_0_1px_rgba(255,255,255,.10),0_0_30px_6px_rgba(0,255,255,.08)]",
            ].join(" ")}
        >
            {/* gradient top border accent */}
            <span
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r ${accent} opacity-70`}
            />

            {/* neon corner sweep */}
            <span
                aria-hidden
                className={`absolute -right-24 -top-24 h-48 w-48 rounded-full blur-3xl opacity-0 transition duration-500 group-hover:opacity-40 bg-gradient-to-tr ${accent}`}
            />

            {/* scanline film for the card */}
            <span
                aria-hidden
                className="absolute inset-0 rounded-2xl opacity-[0.06] [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.8)_0,rgba(255,255,255,.8)_1px,transparent_2px,transparent_3px)]"
            />

            {/* content */}
            <div className="flex items-center gap-3">
                <div
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <Icon className="h-5 w-5 text-white/90"/>
                    <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5"/>
                </div>
                <div className="ml-auto opacity-0 transition group-hover:opacity-100">
                    <ArrowUpRight className="h-5 w-5 text-white/70"/>
                </div>
            </div>

            <div className="mt-1">
                <h2 className="text-lg font-medium tracking-tight">{title}</h2>
                <p className="text-sm text-zinc-400 group-hover:text-zinc-300">{subtitle}</p>
            </div>

            {/* bottom neon underline on hover */}
            <span
                aria-hidden
                className={`absolute inset-x-6 bottom-4 h-px scale-x-0 bg-gradient-to-r ${accent} transition-transform duration-500 group-hover:scale-x-100`}
            />
        </a>
    );
}
