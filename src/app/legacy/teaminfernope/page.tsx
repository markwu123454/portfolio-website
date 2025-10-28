// app/projects/team-infernope/page.tsx
"use client"

import {motion} from "framer-motion"
import {AlertCircle, Wrench, Lightbulb, Sword, Trophy} from "lucide-react"

// ------------------- ANIMATION VARIANTS -------------------
const fadeUp = {
    hidden: {opacity: 0, y: 40},
    show: {opacity: 1, y: 0, transition: {duration: 0.6}},
}

// ------------------- COMPONENT: SECTION DIVIDER -------------------
function Divider({thick = false}: { thick?: boolean }) {
    return (
        <motion.div
            initial={{scaleX: 0}}
            whileInView={{scaleX: 1}}
            transition={{duration: 0.6}}
            className={`origin-left mx-auto ${
                thick ? "h-[4px]" : "h-[2px]"
            } bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 my-24`}
        />
    )
}

// ------------------- COMPONENT: ROBOT SECTION -------------------
function RobotSection({
                          id,
                          title,
                          type,
                          result,
                          image,
                          description,
                          downsides,
                          lessons,
                          notes,
                          reverse,
                      }: {
    id?: string
    title: string
    type?: string
    result?: string
    image: string | string[] // 🔹 can be a single or multiple image paths
    description: string
    downsides: string
    lessons: string
    notes?: string
    reverse?: boolean
}) {
    const images = Array.isArray(image) ? image : [image]

    return (
        <section id={id} className="max-w-6xl mx-auto px-6 py-24">
            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{once: true}}
                variants={fadeUp}
                className={`flex flex-col ${
                    reverse ? "md:flex-row-reverse" : "md:flex-row"
                } items-center gap-10`}
            >
                {/* ---------- IMAGES ---------- */}
                <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
                    {images.length === 1 ? (
                        <motion.img
                            src={images[0]}
                            alt={title}
                            whileHover={{scale: 1.03}}
                            className="rounded-2xl w-full border border-zinc-800 shadow-lg"
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            {images.map((src, i) => (
                                <motion.img
                                    key={i}
                                    src={src}
                                    alt={`${title} ${i + 1}`}
                                    whileHover={{scale: 1.03}}
                                    className="rounded-2xl w-full border border-zinc-800 shadow-lg"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ---------- TEXT ---------- */}
                <div className="md:w-1/2 space-y-4 text-left">
                    <div>
                        <h3 className="text-3xl font-semibold text-white">{title}</h3>
                        {type && (
                            <p className="flex items-center gap-1 text-zinc-400 text-sm">
                                <Sword className="h-4 w-4 text-zinc-500"/> <strong>Type:</strong> {type}
                            </p>
                        )}
                        {result && (
                            <p className="flex items-center gap-1 text-zinc-500 text-sm">
                                <Trophy className="h-4 w-4 text-amber-400"/> <strong>Result:</strong> {result}
                            </p>
                        )}
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>

                    {notes && (
                        <div className="flex items-start gap-2">
                            <Wrench className="text-zinc-400 mt-1 h-5 w-5 shrink-0"/>
                            <p className="text-zinc-400 text-sm">
                                <strong>Notes:</strong> {notes}
                            </p>
                        </div>
                    )}

                    <div className="flex items-start gap-2">
                        <AlertCircle className="text-rose-400 mt-1 h-5 w-5 shrink-0"/>
                        <p className="text-rose-400 text-sm">
                            <strong>Downsides:</strong> {downsides}
                        </p>
                    </div>

                    <div className="flex items-start gap-2">
                        <Lightbulb className="text-emerald-400 mt-1 h-5 w-5 shrink-0"/>
                        <p className="text-emerald-400 text-sm">
                            <strong>Lessons Learned:</strong> {lessons}
                        </p>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}


// ------------------- COMPONENT: TIMELINE -------------------
function Timeline() {
    const items = [
        {id: "year1", label: "Year 1"},
        {id: "between1and2", label: "Between 1 & 2"},
        {id: "year2", label: "Year 2"},
        {id: "between2and3", label: "Between 2 & 3"},
        {id: "year3a", label: "Year 3 (1st Semester)"},
        {id: "year3b", label: "Year 3 (2nd Semester)"},
        {id: "after3", label: "After 3rd Year"},
    ]

    return (
        <div className="relative mt-20 w-[130%] -ml-[15%]">
            <div className="absolute top-[9px] left-0 right-0 h-[2px] bg-zinc-700"/>
            <div className="flex justify-between items-start relative w-full">
                {items.map((t, i) => (
                    <motion.button
                        key={i}
                        onClick={() => {
                            const el = document.getElementById(t.id)
                            if (el) el.scrollIntoView({behavior: "smooth", block: "start"})
                        }}
                        whileHover={{scale: 1.1}}
                        className="group relative flex flex-col items-center text-center flex-1 px-4 cursor-pointer focus:outline-none"
                    >
                        <motion.div
                            layoutId={`dot-${t.id}`}
                            className="w-5 h-5 rounded-full bg-zinc-700 group-hover:bg-zinc-200 transition mb-2 shrink-0"
                        />
                        <span
                            className="text-sm text-zinc-400 group-hover:text-zinc-100 transition leading-snug max-w-[9rem]">
      {t.label}
    </span>
                    </motion.button>
                ))}

            </div>
        </div>
    )
}

// ------------------- COMPONENT: HERO -------------------
function Hero() {
    return (
        <section className="h-screen flex flex-col justify-center px-6">
            <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="max-w-5xl mx-auto text-center space-y-8"
            >
                {/* ---------- LOGO ---------- */}
                <motion.img
                    src="/infernope/image (3).png" // ⬅️ change this path to your actual logo file
                    alt="Team Infernope Logo"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    className="mx-auto w-40 h-40 object-contain rounded-xl shadow-lg border border-zinc-800"
                />

                {/* ---------- TITLE + DESCRIPTION ---------- */}
                <h1 className="text-5xl font-bold tracking-tight mt-6">Team Infernope</h1>
                <p className="text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                    A three-year evolution of combat robots, each testing new engineering principles—from voltage scaling to
                    modular chassis and energy efficiency. Every robot was a deliberate step in mechanical and electrical design.
                </p>

                {/* ---------- TIMELINE ---------- */}
                <Timeline />

                {/* ---------- LINKS ---------- */}
                <motion.a
                    href="https://teaminfernope.wordpress.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    className="inline-block px-8 py-4 border border-zinc-700 rounded-xl text-lg font-medium text-zinc-200 hover:bg-zinc-900 hover:border-zinc-500 transition mt-16"
                >
                    Official Website (Legacy)
                </motion.a>

                <motion.a
                    href="https://www.youtube.com/@TeamInfernope/featured"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    className="inline-block px-8 py-4 ml-10 border border-zinc-700 rounded-xl text-lg font-medium text-zinc-200 hover:bg-zinc-900 hover:border-zinc-500 transition mt-4"
                >
                    YouTube Channel
                </motion.a>
            </motion.div>
        </section>
    )
}


// ------------------- MAIN PAGE -------------------
export default function TeamInfernope() {
    return (
        <main className="bg-black text-zinc-100 scroll-smooth">
            <Hero/>

            {/* YEAR 1 */}
            <RobotSection
                id="year1"
                title="Horizontal Spinner"
                type="Horizontal Spinner"
                image="/infernope/Screenshot 2025-10-27 201510.png"
                description="The first attempt at a combat robot. It never operated successfully but marked the start of experimentation with chassis and drive systems."
                downsides="No functional drivetrain or weapon; lacked understanding of assembly fundamentals."
                lessons="Use proper fasteners and alignments. Begin testing small subsystems before full assembly."
                result="Non-functional design"
            />
            <Divider/>

            {/* BETWEEN 1 & 2 */}
            <RobotSection
                id="between1and2"
                title="Experimental Shell Spinners"
                type="Shell Spinner"
                image={["/infernope/Screenshot 2025-10-27 210335.png", "/infernope/Screenshot 2025-10-27 205318.png"]}
                description="Concept CADs of shell spinners developed between Year 1 and 2, focusing on rotational stability and 3D printing feasibility."
                downsides="None were completed due to impractical manufacturing constraints."
                lessons="Learned part balancing and assembly alignment in Fusion 360 and TinkerCAD."
                result="CAD Practice"
                reverse
            />
            <Divider thick/>

            {/* YEAR 2 */}
            <RobotSection
                id="year2"
                title="Thwack!"
                type="Thwack Bot"
                image={["/infernope/Screenshot 2025-10-27 220111.png", "/infernope/Screenshot 2025-10-27 220153.png"]}
                description="A simple thwack bot with interchangeable attachments designed for impact-based defense."
                downsides="No active weapon. Incorrect gear ratio made the drive too slow for effective hits."
                lessons="Learned to design 3D-printed wheel hubs with strong mounting interfaces and high traction; Learned basic modular design."
                result="1-0-2 at end of year double elim."
            />
            <Divider/>

            {/* BETWEEN 2 & 3 */}
            <RobotSection
                id="between2and3"
                title="Doomstone"
                type="Horizontal Bar Spinner"
                image="/infernope/Screenshot 2025-10-27 215736.png"
                description="A heavy horizontal bar spinner optimized for kinetic impact. The first fully functional robot with an active weapon."
                downsides="Slow weapon spin-up due to power limits."
                lessons="Always test electrical systems individually to prevent damage from miswiring."
                result="Practice build"
                reverse
            />
            <RobotSection
                title="Vert"
                type="Duel-Disk Vertical Spinner"
                image="/infernope/Screenshot 2025-10-27 205543.png"
                description="A large dual-blade vertical spinner, emphasizing upward impact and wedge-driven control."
                downsides="Hard to balance; 3D printing defects caused inconsistent wedge performance."
                lessons="Introduced balancing methods for high-speed weapons and modular wedge interfaces."
                result="Practice build"
            />
            <Divider thick/>

            {/* YEAR 3A */}
            <RobotSection
                id="year3a"
                title="300g Bot"
                type="Vertical Beater Bar"
                image={["/infernope/Screenshot 2025-10-27 202823.png", "/infernope/Screenshot 2025-10-27 222440.png"]}
                description="A 300g beater bar bot designed for weight efficiency while maintaining striking capability."
                downsides="Strong design but unlucky tournament placement."
                lessons="Learned to reduce print weight and utilize weapon vortex for cooling."
                result="Eliminated at quals"
                reverse
            />
            <RobotSection
                title="90 Degrees"
                type="Bristledrive Horizontal Disk Spinner"
                image="/infernope/Screenshot 2025-10-27 202504.png"
                description="A bristle-drive horizontal spinner without wheels, relying on vibrations for movement. Exploited weight bonus for a heavier weapon."
                downsides="Extremely slow and hard to control; excessive vibration caused instability."
                lessons="Gained insight into vibration damping and energy absorption in chassis design."
                result="Eliminated at round of 32"
            />
            <Divider thick/>

            {/* YEAR 3B */}
            <RobotSection
                id="year3b"
                title="MAD"
                type="Horizontal Bar Spinner"
                image={["/infernope/Screenshot 2025-10-27 215322.png", "/infernope/Weixin Image_20251027221940_87_27.jpg",  "/infernope/Screenshot 2025-10-27 222312.png"]}
                description="An upgraded horizontal spinner running a 6S system instead of 3S, doubling voltage for higher energy output."
                downsides="Faulty belt system limited weapon to 30% power."
                lessons="Learned multi-voltage integration: 12V drive and 24V weapon systems."
                result="2nd place @ End-of-Year Tournament"
                reverse
            />
            <RobotSection
                title="Good Game"
                type="Vertical Disk/Bar Spinner"
                image={["/infernope/Screenshot 2025-10-27 221114.png", "/infernope/Screenshot 2025-10-27 221553.png", "/infernope/Weixin Image_20251027221936_84_27.jpg", "/infernope/Weixin Image_20251027221938_85_27.jpg"]}
                description="A flagship vertical disk spinner with swappable wheels, weapons, and attachments for opponent-specific optimization."
                downsides="Underestimated weapon forces led to broken bolts and bearings."
                lessons="Discovered modular part design and belt-driven isolation for motor protection."
                result="1st place @ End-of-Year Tournament"
            />
            <RobotSection
                title="Hello Kitty"
                type="Drum Spinner"
                image="/infernope/Screenshot 2025-10-27 220835.png"
                description="A small egg-beater robot built in 3 days for a rapid design challenge."
                downsides="Weapon spun in the wrong direction initially; later failed due to incorrect print orientation."
                lessons="Experience in designing under time constraints without prototype testing."
                result="3rd place @ End-of-Year Tournament"
                reverse
            />
            <RobotSection
                title="The Reynolds Pamphlet"
                type="Hammer Bot"
                image="/infernope/Screenshot 2025-10-27 220655.png"
                description="A hammer bot using a torsion spring and sector gear for automatic release. Focused equally on aesthetics and function."
                downsides="Torsion spring too weak, causing low strike energy."
                lessons="Learned brushed DC motor weapon control and integrated gearbox packaging."
                result="4th place @ End-of-Year Tournament"
            />
            <RobotSection
                title="Riptide"
                type="Egg Beater"
                image="/infernope/Screenshot 2025-10-27 223235.png"
                description="A 3lb egg-beater inspired by Riptide (BattleBots) and Ares (NHRL)."
                downsides="Never manufactured due to time constraints."
                lessons="First robot fully designed in Fusion 360 using mixed materials: UHMW and carbon fiber."
                result="CAD Practice"
                reverse
            />
            <Divider thick/>

            {/* AFTER 3 */}
            <RobotSection
                id="after3"
                title="OP"
                type="Vertical Disk Spinner"
                image={["/infernope/Screenshot 2025-10-27 203121.png"]}
                description="A final post-transfer project. Optimized for rotational inertia, storing 300J of kinetic energy in the weapon."
                downsides="Never competed; gyroscopic forces disabled turning at >50% speed."
                lessons="Learned to use hub motors for drive and implemented rubber band–linked 4WD system."
                result="Practice Build"
            />
        </main>
    )
}
