import { motion } from "framer-motion";
import { Mail, ArrowRight, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const footerLinks = {
    Platform:  ["How it Works", "Proposals", "Voting Rules", "Results"],
    Community: ["Discord", "Twitter", "Telegram", "Blog"],
    Legal:     ["Terms of Service", "Privacy Policy", "Cookie Policy"],
  };

  const socials = [
    { name: "Twitter",  href: "#", icon: "𝕏" },
    { name: "Discord",  href: "#", icon: "⬡" },
    { name: "GitHub",   href: "#", icon: "⌂" },
  ];

  return (
    <footer className="relative pt-24 pb-8 overflow-hidden" style={{ background: "#0a0a0f" }}>
      {/* blobs */}
      <div className="blob" style={{ width: 450, height: 450, background: "radial-gradient(circle, #ec4899 0%, transparent 70%)", bottom: "-20%", right: "-12%", opacity: 0.18 }} />
      <div className="blob" style={{ width: 300, height: 300, background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", top: "10%", left: "-8%", opacity: 0.15 }} />

      <div className="container mx-auto px-5 relative z-10">

        {/* ── CTA banner ── */}
        <motion.div
          className="glass-bright rounded-2xl relative overflow-hidden mb-18"
          style={{ marginBottom: "4.5rem" }}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* inner blobs */}
          <div className="blob" style={{ width: 260, height: 260, background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", top: "-30%", right: "10%", opacity: 0.25 }} />
          <div className="blob" style={{ width: 180, height: 180, background: "radial-gradient(circle, #ec4899 0%, transparent 70%)", bottom: "-20%", left: "5%", opacity: 0.2 }} />

          <div className="relative z-10 flex flex-col items-center text-center px-6 py-14 md:py-18" style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
            {/* eyebrow */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-px w-8 rounded-full" style={{ background: "linear-gradient(90deg,transparent,#ec4899)" }} />
              <span className="text-[0.7rem] font-semibold uppercase tracking-widest" style={{ color: "#ec4899", fontFamily: "'Inter',sans-serif" }}>Get Involved</span>
              <div className="h-px w-8 rounded-full" style={{ background: "linear-gradient(270deg,transparent,#ec4899)" }} />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Syne',sans-serif", color: "#fff" }}>
              Have an Event <span className="grad-text">Idea?</span>
            </h3>
            <p className="text-sm max-w-md mb-7" style={{ color: "#6b7280", lineHeight: 1.7 }}>
              Submit your proposal and let the community decide. Your next great event could be just a vote away.
            </p>
            <button className="btn-fancy" onClick={() => navigate('/create')}>
              Submit a Proposal <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ── footer grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

          {/* brand col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7,#c026d3)", boxShadow: "0 0 18px rgba(168,85,247,0.4)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: "'Syne',sans-serif", color: "#fff" }}>
                Campus<span style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Choice</span>
              </span>
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{ color: "#5a5a6e", maxWidth: 320 }}>
              Empowering communities to shape their own experiences through democratic event voting. Every voice matters.
            </p>

            {/* newsletter */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(22,22,38,0.7)", border: "1px solid rgba(168,85,247,0.18)" }}>
                <Mail className="w-4 h-4" style={{ color: "#5a5a6e" }} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-sm outline-none flex-1 placeholder-[#4a4a5e] text-[#e2d9f3]"
                  style={{ fontFamily: "'Inter',sans-serif" }}
                />
              </div>
              <button
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 16px rgba(168,85,247,0.35)" }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* link columns */}
          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ fontFamily: "'Syne',sans-serif", color: "#fff", letterSpacing: "0.1em" }}>
                {cat}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[0.82rem] transition-colors duration-200"
                      style={{ color: "#5a5a6e" }}
                      onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = "#c084fc"}
                      onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = "#5a5a6e"}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── bottom bar ── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6" style={{ borderTop: "1px solid rgba(168,85,247,0.1)" }}>
          <p className="text-[0.75rem]" style={{ color: "#4a4a5e" }}>
            © 2026 CampusChoice. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                className="text-[0.78rem] font-medium transition-colors duration-200"
                style={{ color: "#5a5a6e" }}
                onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = "#a855f7"}
                onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = "#5a5a6e"}
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
