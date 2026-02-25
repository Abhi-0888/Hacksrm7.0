import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "@/providers/Web3Provider";

const HeroSection = () => {
  const navigate = useNavigate();
  const { account, setWalletModalOpen } = useWeb3();

  const handleCTA = (path: string) => {
    if (!account) {
      setWalletModalOpen(true);
    } else {
      navigate(path);
    }
  };
  const stats = [
    { value: "2.5K+", label: "Active Voters", icon: "👥" },
    { value: "156",   label: "Proposals",     icon: "📋" },
    { value: "48",    label: "Events Held",   icon: "🎯" },
    { value: "98%",   label: "Satisfaction",  icon: "✨" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: "#0a0a0f" }}>

      {/* ── ambient blobs ── */}
      <div className="blob" style={{ width: 520, height: 520, background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", top: "-15%", left: "-12%", opacity: 0.28 }} />
      <div className="blob" style={{ width: 400, height: 400, background: "radial-gradient(circle, #ec4899 0%, transparent 70%)", bottom: "5%", right: "-10%", opacity: 0.22 }} />
      <div className="blob" style={{ width: 250, height: 250, background: "radial-gradient(circle, #a855f7 0%, transparent 70%)", top: "55%", left: "35%", opacity: 0.15 }} />

      {/* ── decorative ring ── */}
      <motion.div
        className="absolute"
        style={{
          width: 480, height: 480,
          borderRadius: "50%",
          border: "1px solid rgba(168,85,247,0.18)",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
        }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [.4, 0, .2, 1] }}
      />
      <motion.div
        className="absolute"
        style={{
          width: 340, height: 340,
          borderRadius: "50%",
          border: "1px solid rgba(236,72,153,0.12)",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
        }}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.15, ease: [.4, 0, .2, 1] }}
      />

      {/* ── spinning gradient ring (outer) ── */}
      <div className="absolute anim-spin" style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
        <svg width="100%" height="100%" viewBox="0 0 600 600">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="300" cy="300" r="280" fill="none" stroke="url(#ringGrad)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* ── floating accent dots ── */}
      {[
        { size: 6, top: "18%", left: "22%", color: "#a855f7", delay: 0 },
        { size: 4, top: "72%", left: "75%", color: "#ec4899", delay: 1.5 },
        { size: 8, top: "30%", left: "78%", color: "#c084fc", delay: 0.8 },
        { size: 5, top: "65%", left: "18%", color: "#f472b6", delay: 2 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: dot.size, height: dot.size, background: dot.color, top: dot.top, left: dot.left, boxShadow: `0 0 ${dot.size * 2}px ${dot.color}` }}
          animate={{ y: [0, -12, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, delay: dot.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 max-w-4xl mx-auto">

        {/* tag pill */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          <span className="badge-active"><span className="dot" /> Live</span>
          <span className="text-xs font-medium" style={{ color: "#9ca3af", fontFamily: "'Inter',sans-serif" }}>Community Driven Since 2024</span>
        </motion.div>

        {/* headline */}
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.08] mb-6"
          style={{ fontFamily: "'Syne', sans-serif", color: "#fff" }}
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          Vote For Your
          <br />
          <span className="grad-text">Next Event</span>
        </motion.h1>

        {/* sub */}
        <motion.p
          className="text-base md:text-lg max-w-xl leading-relaxed mb-10"
          style={{ color: "#7a7a8e", fontFamily: "'Inter',sans-serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55 }}
        >
          Submit proposals, cast your vote, and shape the events that matter to you.
          Your voice, your choice — amplified.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.7 }}
        >
          <button onClick={() => handleCTA('/dashboard')} className="btn-fancy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
            Active Proposals
          </button>
          <button onClick={() => handleCTA('/create')} className="btn-outline-fancy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Submit Proposal
          </button>
        </motion.div>

        {/* ── stats row ── */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.95 }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1 px-3 py-4 rounded-2xl"
              style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.1)" }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 1 + i * 0.1 }}
            >
              <span className="text-lg">{s.icon}</span>
              <p className="text-xl md:text-2xl font-bold grad-text" style={{ fontFamily: "'Syne',sans-serif" }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: "#6b7280", fontFamily: "'Inter',sans-serif", letterSpacing: "0.04em" }}>{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── scroll hint ── */}
      <motion.div
        className="absolute bottom-8 left-1/2"
        style={{ transform: "translateX(-50%)" }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown className="w-5 h-5" style={{ color: "#4a4a5e" }} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
