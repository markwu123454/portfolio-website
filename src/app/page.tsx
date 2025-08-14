// from-black via-zinc-700 to-zinc-200
import Link from "next/link";

export default function HomePage() {
    return (
        <div
            className="flex flex-col justify-start min-h-screen pt-10 px-10 space-y-8 bg-gradient-to-b text-white">
            {/* Hero Section */}
            <section className="max-w-5xl">
                <h1 className="text-5xl font-extrabold tracking-tight">
                    Hi! I&#39;m Mark.
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                    A showcase of projects, ideas, and experiments. Explore my work in
                    software development, robotics, and creative design.
                </p>
            </section>

            {/* About Section */}
            <section className="max-w-4xl space-y-3">
                <h2 className="text-2xl font-bold">About me</h2>
                <p className="text-gray-300">
                    This site serves as a central hub for all my major projects and
                    collaborations. Each page contains detailed overviews, technical
                    write-ups, and links to code or live demos.
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                    <li>Learn about my background and skill set</li>
                    <li>See how I approach problem solving and design</li>
                    <li>Access code repositories and technical documentation</li>
                </ul>
            </section>

            {/* Featured Projects Placeholder */}
            <section className="max-w-6xl">
                <h2 className="text-2xl font-bold mb-4">Featured Projects</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {["Project One", "Project Two", "Project Three"].map((name, i) => (
                        <div
                            key={i}
                            className="rounded-lg bg-zinc-900/80 border border-white/10 p-4 hover:bg-zinc-800 transition-colors"
                        >
                            <h3 className="text-xl font-semibold">{name}</h3>
                            <p className="mt-2 text-gray-400">
                                Brief description of {name} with the main technologies used
                                and its purpose.
                            </p>
                            <button className="mt-3 text-sm font-medium text-white/80 hover:text-white underline">
                                Learn more →
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="max-w-4xl space-y-3">
                <h2 className="text-2xl font-bold">Links</h2>
                <p className="text-gray-300">
                    Interested in collaborating or learning more about my work?
                    Reach out via the contact form.
                </p>
                <div className="flex gap-4">
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=me@markwu.org"
                       target="_blank" rel="noopener noreferrer">
                        Email Me (Gmail)
                    </a>
                    <Link
                        href="https://github.com/markwu123454"
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white
                 border border-white/20 bg-black/40 backdrop-blur
                 hover:bg-black/60 transition focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
                            <path fill="currentColor" fill-rule="evenodd"
                                  d="M7.976 0A7.977 7.977 0 0 0 0 7.976c0 3.522 2.3 6.507 5.431 7.584c.392.049.538-.196.538-.392v-1.37c-2.201.49-2.69-1.076-2.69-1.076c-.343-.93-.881-1.175-.881-1.175c-.734-.489.048-.489.048-.489c.783.049 1.224.832 1.224.832c.734 1.223 1.859.88 2.3.685c.048-.538.293-.88.489-1.076c-1.762-.196-3.621-.881-3.621-3.964c0-.88.293-1.566.832-2.153c-.05-.147-.343-.978.098-2.055c0 0 .685-.196 2.201.832c.636-.196 1.322-.245 2.007-.245s1.37.098 2.006.245c1.517-1.027 2.202-.832 2.202-.832c.44 1.077.146 1.908.097 2.104a3.16 3.16 0 0 1 .832 2.153c0 3.083-1.86 3.719-3.62 3.915c.293.244.538.733.538 1.467v2.202c0 .196.146.44.538.392A7.984 7.984 0 0 0 16 7.976C15.951 3.572 12.38 0 7.976 0"
                                  clip-rule="evenodd"/>
                        </svg>
                        <span className="font-medium">GitHub Profile</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}
