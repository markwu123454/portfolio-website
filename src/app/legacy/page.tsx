"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// === INDIVIDUAL CARD COMPONENT ===
function TimelineCard({
                          side = "left",
                          title,
                          description,
                          image,
                          link,
                      }: {
    side?: "left" | "right";
    title: string;
    description: string;
    image?: string;
    link?: string;
}) {
    const router = useRouter();

    const isClickable = !!link;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            onClick={() => link && router.push(link)}
            className={`flex items-center group relative ${
                isClickable ? "cursor-pointer" : "cursor-default"
            } ${side === "left" ? "justify-end" : "justify-start"}`}
        >
            {/* Dot */}
            <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-zinc-950 border-2 border-zinc-700 rounded-full z-10 group-hover:border-zinc-400 transition" />

            {/* Card */}
            <div
                className={`w-[45%] border border-zinc-700 rounded-xl p-5 bg-zinc-900 shadow-lg shadow-zinc-950/30 transition 
          ${side === "left" ? "mr-[55%] text-right" : "ml-[55%]"}
          ${
                    isClickable
                        ? "hover:border-zinc-500 hover:bg-zinc-800/50"
                        : "opacity-90"
                }`}
            >
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                    {description}
                </p>
                {image && (
                    <img
                        src={image}
                        alt={title}
                        className="mt-4 rounded-lg border border-zinc-800"
                    />
                )}
            </div>
        </motion.div>
    );
}


// === SECTION HEADER (Grade / Year) ===
function TimelineSection({ label }: { label: string }) {
    return (
        <div className="relative flex justify-center items-center my-20">
            <div className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-zinc-700 h-full -z-10" />
            <div className="px-8 py-3 bg-zinc-950 border border-zinc-700 rounded-full text-zinc-300 font-semibold text-xl tracking-wide shadow-md shadow-zinc-950/30">
                {label}
            </div>
        </div>
    );
}

// === MAIN PAGE ===
export default function PastProjects() {
    return (
        <section className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 py-24 mt-24">
            <div className="max-w-5xl mx-auto px-4 relative">
                <h1 className="text-4xl font-bold text-center">Past Projects</h1>

                <div className="relative">
                    {/* Center vertical line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-zinc-800" />

                    <div className="space-y-24 relative">

                        <TimelineSection label="Grade 6" />
                        <TimelineCard
                            side="left"
                            title="FIRST Lego League"
                            description="I captained a FLL team for a year in G6."
                            image="/infernope/Weixin Image_20250924095020_194_36.jpg"
                        />

                        <TimelineSection label="Grade 7" />
                        <TimelineCard
                            side="right"
                            title="VeX IQ"
                            description="I captaind a Vex IQ team for 2 years from G7-G8."
                            image="/infernope/Weixin Image_20250924095021_195_36.jpg"
                        />

                        <TimelineSection label="Grade 8" />
                        <TimelineCard
                            side="left"
                            title="Year 1 of combat robotics"
                            description="The beginning of my journey into 3D printing and combat robotics."
                            link="/legacy/teaminfernope"
                            image="/infernope/Weixin Image_20250924095022_196_36.jpg"
                        />

                        <TimelineSection label="Grade 10" />
                        <TimelineCard
                            side="right"
                            title="Year 3 of combat robotics"
                            description="This year I put in much more effort, and combined with more experince, I was able to build 7 robots in total."
                            link="/legacy/teaminfernope"
                            image="/infernope/Weixin Image_20250924095024_198_36.jpg"
                        />

                        <TimelineSection label="Grade 11" />
                        <TimelineCard
                            side="left"
                            title="SigmaCat Robotics"
                            description="A RIVAL Robotics Competition team that I designed and programmed for."
                            link="/legacy/sigmacat"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
