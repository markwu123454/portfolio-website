// app/contact/page.tsx
import { Mail, Github } from "lucide-react";

export default function ContactPage() {
    return (
        <main className="pt-24 min-h-[calc(100vh-69px)] px-6 bg-black text-white flex items-center">
            <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold mb-3">Let’s Connect</h1>
                <p className="text-zinc-400 mb-10">
                    Always open to collaborations, projects, or just a quick chat.
                </p>

                <div className="grid gap-6 sm:grid-cols-2">
                    <a
                        href="mailto:me@markwu.org"
                        className="group flex flex-col items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 p-6 hover:bg-zinc-700 transition-colors"
                    >
                        <Mail className="h-8 w-8" />
                        <span className="font-medium text-lg">Email</span>
                        <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                            Send me a direct email
                        </p>
                    </a>

                    <a
                        href="https://github.com/markwu123454"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 p-6 hover:bg-zinc-700 transition-colors"
                    >
                        <Github className="h-8 w-8" />
                        <span className="font-medium text-lg">GitHub</span>
                        <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                            Explore my code and projects
                        </p>
                    </a>
                </div>
            </div>
        </main>
    );
}
