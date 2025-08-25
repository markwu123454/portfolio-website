export function Footer() {
    return (
        <footer className="relative border-t border-white/10 bg-black/80 backdrop-blur-sm">
            {/* faint top neon accent */}
            <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 opacity-70"
            />

            <div className="mx-auto max-w-5xl py-6 px-4 text-center text-sm text-zinc-500">
                <span className="block">
                    © 2025 <span className="text-zinc-300">Mark Wu</span>.
                </span>
                <span className="block">
                    Licensed under{" "}
                    <a
                        href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-cyan-300 transition-colors"
                    >
                        CC BY-NC-ND 4.0
                    </a>
                    .
                </span>
                <span className="block mt-1">
                    <a
                        href="mailto:me@markwu.org"
                        className="text-zinc-400 hover:text-fuchsia-300 underline decoration-dotted transition-colors"
                    >
                        me@markwu.org
                    </a>
                </span>
            </div>
        </footer>
    );
}
