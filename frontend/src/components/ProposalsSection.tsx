import { motion } from "framer-motion";
import { ThumbsUp, Clock, Users, ChevronRight, MapPin } from "lucide-react";

interface EventProposal {
  id: number;
  title: string;
  location: string;
  date: string;
  image: string;
  votes: number;
  maxVotes: number;
  status: "active" | "ended" | "upcoming";
  category: string;
}

const mockProposals: EventProposal[] = [
  {
    id: 1,
    title: "Tech Conference 2026",
    location: "San Francisco",
    date: "Mar 15, 2026",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=700&fit=crop",
    votes: 1245,
    maxVotes: 2000,
    status: "active",
    category: "Technology",
  },
  {
    id: 2,
    title: "Music Festival Night",
    location: "Austin",
    date: "Apr 22, 2026",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=700&fit=crop",
    votes: 890,
    maxVotes: 1500,
    status: "active",
    category: "Music",
  },
  {
    id: 3,
    title: "Startup Pitch Day",
    location: "New York",
    date: "May 10, 2026",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=700&fit=crop",
    votes: 567,
    maxVotes: 1000,
    status: "active",
    category: "Business",
  },
  {
    id: 4,
    title: "Art Exhibition Gala",
    location: "Los Angeles",
    date: "Jun 5, 2026",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&h=700&fit=crop",
    votes: 423,
    maxVotes: 800,
    status: "upcoming",
    category: "Art",
  },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Technology: { bg: "rgba(168,85,247,0.15)", text: "#c084fc", border: "rgba(168,85,247,0.3)" },
  Music:      { bg: "rgba(236,72,153,0.15)", text: "#f472b6", border: "rgba(236,72,153,0.3)" },
  Business:   { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  Art:        { bg: "rgba(249,115,22,0.15)", text: "#fb923c", border: "rgba(249,115,22,0.3)" },
};

const ProposalCard = ({ proposal, index }: { proposal: EventProposal; index: number }) => {
  const pct = Math.round((proposal.votes / proposal.maxVotes) * 100);
  const cat = categoryColors[proposal.category] || categoryColors.Technology;

  return (
    <motion.div
      className="card-fancy group cursor-pointer flex flex-col"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [.4, 0, .2, 1] }}
    >
      {/* ── image area ── */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={proposal.image}
          alt={proposal.title}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
          style={{ transition: "transform 0.6s cubic-bezier(.4,0,.2,1)" }}
        />
        {/* dark overlay for text readability */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.2) 55%, transparent 100%)" }} />

        {/* status badge top-right */}
        <div className="absolute top-3.5 right-3.5">
          {proposal.status === "active" ? (
            <span className="badge-active"><span className="dot" /> Vote Now</span>
          ) : (
            <span className="badge-upcoming">Soon</span>
          )}
        </div>

        {/* category pill top-left */}
        <div
          className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full text-[0.7rem] font-semibold"
          style={{ background: cat.bg, color: cat.text, border: `1px solid ${cat.border}`, letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          {proposal.category}
        </div>

        {/* date bottom-left */}
        <div className="absolute bottom-3 left-4">
          <p className="text-[0.68rem] font-medium" style={{ color: "#7a7a8e", letterSpacing: "0.08em", textTransform: "uppercase" }}>{proposal.date}</p>
        </div>
      </div>

      {/* ── body ── */}
      <div className="flex-1 flex flex-col p-5">
        <h3
          className="text-lg font-bold mb-1.5 transition-colors duration-300"
          style={{ fontFamily: "'Syne',sans-serif", color: "#fff" }}
        >
          {proposal.title}
        </h3>

        <p className="flex items-center gap-1.5 text-[0.78rem] mb-4" style={{ color: "#6b7280" }}>
          <MapPin className="w-3.5 h-3.5" />
          {proposal.location}
        </p>

        {/* vote progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[0.75rem] mb-1.5">
            <span className="flex items-center gap-1.5" style={{ color: "#6b7280" }}>
              <ThumbsUp className="w-3.5 h-3.5" />
              {proposal.votes.toLocaleString()} votes
            </span>
            <span className="font-bold" style={{ color: "#c084fc", fontFamily: "'Syne',sans-serif" }}>{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* CTA */}
        <button
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
          style={{
            fontFamily: "'Syne',sans-serif",
            color: "#c084fc",
            background: "rgba(168,85,247,0.08)",
            border: "1px solid rgba(168,85,247,0.18)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "linear-gradient(135deg,#7c3aed,#a855f7)";
            el.style.color = "#fff";
            el.style.borderColor = "transparent";
            el.style.boxShadow = "0 0 24px rgba(168,85,247,0.4)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(168,85,247,0.08)";
            el.style.color = "#c084fc";
            el.style.borderColor = "rgba(168,85,247,0.18)";
            el.style.boxShadow = "none";
          }}
        >
          View Details <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const ProposalsSection = () => {
  const quickStats = [
    { icon: Clock,     value: "12",    label: "Active Votings",     color: "#a855f7" },
    { icon: ThumbsUp,  value: "8,432", label: "Total Votes Cast",  color: "#ec4899" },
    { icon: Users,     value: "2,156", label: "Community Members", color: "#60a5fa" },
  ];

  return (
    <section id="proposals" className="relative py-28 overflow-hidden" style={{ background: "#0a0a0f" }}>
      {/* ambient blob center */}
      <div className="blob" style={{ width: 500, height: 500, background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", top: "40%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.12 }} />

      <div className="container mx-auto px-5 relative z-10">

        {/* ── section header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            {/* eyebrow */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-px w-10 rounded-full" style={{ background: "linear-gradient(90deg,#a855f7,transparent)" }} />
              <span className="text-[0.7rem] font-semibold uppercase tracking-widest" style={{ color: "#a855f7", fontFamily: "'Inter',sans-serif" }}>Proposals</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Syne',sans-serif", color: "#fff" }}>
              Active <span className="grad-text">Proposals</span>
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#6b7280" }}>Vote on upcoming events and shape our community</p>
          </motion.div>

          <motion.a
            href="#"
            className="flex items-center gap-1.5 text-sm font-semibold mt-5 md:mt-0 transition-gap duration-300"
            style={{ color: "#a855f7", fontFamily: "'Syne',sans-serif" }}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            See All <ChevronRight className="w-4 h-4" />
          </motion.a>
        </div>

        {/* ── cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockProposals.map((p, i) => <ProposalCard key={p.id} proposal={p} index={i} />)}
        </div>

        {/* ── quick stats bar ── */}
        <motion.div
          className="mt-14 glass-bright rounded-2xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(168,85,247,0.1)]">
            {quickStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-4 px-6 py-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                    <Icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ fontFamily: "'Syne',sans-serif", color: "#fff" }}>{s.value}</p>
                    <p className="text-[0.75rem]" style={{ color: "#6b7280" }}>{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProposalsSection;
