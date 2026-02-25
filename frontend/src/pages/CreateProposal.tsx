import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Rocket, Sparkles, Link as LinkIcon, AlertCircle, TrendingUp, Info, ArrowLeft, Wallet } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletConnectModal from "@/components/WalletConnectModal";
import { useWeb3 } from "@/providers/Web3Provider";
import { useApp } from "@/context/AppContext";

export default function CreateProposal() {
  const { account, setWalletModalOpen } = useWeb3();
  const { submitProposal, txPending } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    recipient: "",
    duration: "21600",
    voting_model: "TOKEN_WEIGHTED",
    venue: "",
    host: "",
  });

  // Auto-fill recipient with connected wallet
  useEffect(() => {
    if (account) {
      setFormData(prev => ({ ...prev, recipient: account }));
    }
  }, [account]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    score: number;
    suggestions: string[];
    insight: string;
    matchType: string;
  } | null>(null);

  const handleField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleAIAnalysis = async () => {
    if (!formData.title || !formData.description || !formData.amount) {
      alert("Please fill in the title, description, and amount first.");
      return;
    }
    setAiLoading(true);
    try {
      // TODO: integrate real AI service
      await new Promise((r) => setTimeout(r, 1500));
      setAiResult({
        score: 78,
        suggestions: [
          "Consider adding more detail about expected attendance",
          "Include a breakdown of how funds will be allocated",
        ],
        insight: "This proposal aligns well with previous successful campus events in terms of scope and budget.",
        matchType: "campus event",
      });
    } catch {
      console.error("AI Analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    // Build IPFS-style CID from description for on-chain storage
    const ipfsCID = formData.description.slice(0, 46) || "QmPlaceholder";
    const success = await submitProposal(formData.title, ipfsCID, Number(formData.duration));
    if (success) navigate("/dashboard");
  };

  // ── Input style shared ──
  const inputCls =
    "w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-[#4a4a5e]";
  const inputStyle = {
    background: "rgba(10,10,18,0.8)",
    border: "1px solid rgba(168,85,247,0.15)",
    fontFamily: "'Inter',sans-serif",
  };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)";
    e.currentTarget.style.boxShadow = "0 0 16px rgba(168,85,247,0.1)";
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "rgba(168,85,247,0.15)";
    e.currentTarget.style.boxShadow = "none";
  };

  // ── Wallet gate ──
  if (!account) {
    return (
      <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
        <Header />
        <WalletConnectModal />
        <div className="pt-28 flex flex-col items-center justify-center min-h-[70vh] px-4">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <Wallet className="w-9 h-9" style={{ color: "#a855f7" }} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>
              Connect Your Wallet
            </h2>
            <p className="text-sm mb-6" style={{ color: "#7a7a8e" }}>
              You need to connect your wallet to create proposals.
            </p>
            <button onClick={() => setWalletModalOpen(true)} className="btn-fancy mx-auto">
              Connect Wallet
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#0a0a0f' }}>
      <Header />
      <WalletConnectModal />

      {/* ── Background Blobs (matching Landing Page) ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[80px] opacity-15 animate-blob"
             style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full mix-blend-screen filter blur-[80px] opacity-10 animate-blob animation-delay-2000"
             style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }} />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-5 max-w-4xl mx-auto">
        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm mb-8 transition-colors group"
            style={{ color: "#7a7a8e" }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="group-hover:text-[#c084fc] transition-colors">Back</span>
          </button>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>
            Proposer <span className="grad-text">Dashboard</span>
          </h1>
          <p className="text-base mb-10 max-w-lg" style={{ color: "#7a7a8e", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
            Submit new events and track your impact. Shape the future of campus life.
          </p>
        </motion.div>

        {/* ── Create Proposal Section ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <h2 className="text-xl font-bold text-white mb-5" style={{ fontFamily: "'Syne',sans-serif" }}>
            Create New Proposal
          </h2>

          {/* ── CArd ── */}
          <div
            className="rounded-3xl p-8 md:p-10 mb-8"
            style={{
              background: "rgba(16,16,28,0.6)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(168,85,247,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header with token balance */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
                  Proposal Details
                </h3>
                <p className="text-xs mt-1" style={{ color: "#7a7a8e" }}>
                  Submit a new event for community funding
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs" style={{ color: "#7a7a8e" }}>
                  Gov Token Balance:{" "}
                  <span className="font-mono text-white font-medium">300.0</span>
                </p>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    color: "#c084fc",
                    background: "rgba(168,85,247,0.06)",
                    border: "1px solid rgba(168,85,247,0.2)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.06)"; }}
                >
                  <LinkIcon className="w-3 h-3" /> Mint Mock Tokens
                </button>
              </div>
            </div>

            {/* Requirements badge */}
            <div
              className="flex items-start gap-3 rounded-xl p-4 mb-8"
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.15)",
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
              <div className="text-sm leading-relaxed" style={{ color: "rgba(245,158,11,0.9)" }}>
                <span className="font-semibold" style={{ color: "#fbbf24" }}>Requirements:</span> Min 100 Tokens to propose.
                <br />
                Fee: 0.01 ETH (Refundable).
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium pl-1" style={{ color: "#d1d5db" }}>Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Hackathon 2026"
                  className={inputCls}
                  style={inputStyle}
                  value={formData.title}
                  onChange={(e) => handleField("title", e.target.value)}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium pl-1" style={{ color: "#d1d5db" }}>Description</label>
                <textarea
                  placeholder="Detailed description of the event..."
                  className={inputCls + " h-36 resize-none leading-relaxed"}
                  style={inputStyle}
                  value={formData.description}
                  onChange={(e) => handleField("description", e.target.value)}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  required
                />
              </div>

              {/* 2-col: Amount + Recipient */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1" style={{ color: "#d1d5db" }}>Request Amount (ETH)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.0"
                      className={inputCls}
                      style={inputStyle}
                      value={formData.amount}
                      onChange={(e) => handleField("amount", e.target.value)}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6b7280] font-mono pointer-events-none">ETH</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1" style={{ color: "#d1d5db" }}>Recipient Address</label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      className={inputCls}
                      style={{
                        ...inputStyle,
                        borderColor: formData.recipient && account && formData.recipient.toLowerCase() !== account.toLowerCase()
                          ? "rgba(245,158,11,0.5)"
                          : inputStyle.border.split(' ')[2]
                      }}
                      value={formData.recipient}
                      onChange={(e) => handleField("recipient", e.target.value)}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                    {formData.recipient && account && formData.recipient.toLowerCase() !== account.toLowerCase() && (
                      <div className="flex items-start gap-2 text-xs px-2" style={{ color: "#fbbf24" }}>
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong className="font-semibold">Note:</strong> Funds will be sent to a different address than your connected wallet.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2-col: Venue + Host */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1" style={{ color: "#d1d5db" }}>Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium"
                    className={inputCls}
                    style={inputStyle}
                    value={formData.venue}
                    onChange={(e) => handleField("venue", e.target.value)}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1" style={{ color: "#d1d5db" }}>Host / Organizer</label>
                  <input
                    type="text"
                    placeholder="e.g. Student Council"
                    className={inputCls}
                    style={inputStyle}
                    value={formData.host}
                    onChange={(e) => handleField("host", e.target.value)}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              </div>

              {/* 2-col: Duration + Voting Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1" style={{ color: "#d1d5db" }}>Proposal Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "6 Hours", value: "21600" },
                      { label: "12 Hours", value: "43200" },
                      { label: "24 Hours", value: "86400" },
                      { label: "6 Days", value: "518400" },
                      { label: "1 Month", value: "2592000" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleField("duration", opt.value)}
                        className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                        style={{
                          background: formData.duration === opt.value ? "rgba(168,85,247,0.15)" : "rgba(10,10,18,0.6)",
                          border: `1px solid ${formData.duration === opt.value ? "rgba(168,85,247,0.4)" : "rgba(168,85,247,0.1)"}`,
                          color: formData.duration === opt.value ? "#c084fc" : "#9ca3af",
                          boxShadow: formData.duration === opt.value ? "0 0 12px rgba(168,85,247,0.1)" : "none",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium pl-1" style={{ color: "#d1d5db" }}>Voting Model</label>
                  <select
                    className={inputCls + " appearance-none cursor-pointer"}
                    style={inputStyle}
                    value={formData.voting_model}
                    onChange={(e) => handleField("voting_model", e.target.value)}
                    onFocus={inputFocus as any}
                    onBlur={inputBlur as any}
                  >
                    <option value="TOKEN_WEIGHTED">Token Weighted (1 Token = 1 Vote)</option>
                    <option value="QUADRATIC">Quadratic Voting</option>
                  </select>
                </div>
              </div>

              {/* ── Buttons ── */}
              <div className="pt-8 border-t flex flex-col sm:flex-row gap-4" style={{ borderColor: "rgba(168,85,247,0.1)" }}>
                <button
                  type="button"
                  onClick={handleAIAnalysis}
                  disabled={aiLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 group"
                  style={{
                    color: "#c084fc",
                    background: "rgba(168,85,247,0.06)",
                    border: "1px solid rgba(168,85,247,0.2)",
                    opacity: aiLoading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.06)"; }}
                >
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {aiLoading ? "Analyzing..." : "Analyze with AI"}
                </button>

                <button
                  type="submit"
                  disabled={txPending}
                  className="flex-[2] btn-fancy flex items-center justify-center gap-2 text-sm"
                  style={{ padding: "0.85rem 1.5rem", opacity: txPending ? 0.6 : 1 }}
                >
                  <Rocket className="w-4 h-4" />
                  {txPending ? "Submitting..." : "Submit Proposal"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* ── AI Analysis Result ── */}
        {aiResult && (
          <motion.div
            className="rounded-3xl p-8 md:p-10"
            style={{
              background: "rgba(16,16,28,0.6)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(168,85,247,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* AI Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl" style={{ background: "rgba(168,85,247,0.1)" }}>
                <Sparkles className="w-6 h-6" style={{ color: "#a855f7" }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
                  AI Analysis Insights
                </h3>
                <p className="text-xs mt-1" style={{ color: "#7a7a8e" }}>
                  Powered by Campus Intelligence
                </p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-5 rounded-2xl" style={{ background: "rgba(10,10,18,0.6)", border: "1px solid rgba(168,85,247,0.1)" }}>
                <div className="text-[0.65rem] uppercase tracking-wider font-semibold mb-2" style={{ color: "#6b7280" }}>
                  Quality Score
                </div>
                <div className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>{aiResult.score}%</div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(30,30,50,0.8)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: aiResult.score > 70 ? "#34d399" : aiResult.score > 40 ? "#fbbf24" : "#ef4444",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${aiResult.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="col-span-2 p-5 rounded-2xl" style={{ background: "rgba(10,10,18,0.6)", border: "1px solid rgba(168,85,247,0.1)" }}>
                <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-wider font-semibold mb-3" style={{ color: "#6b7280" }}>
                  <TrendingUp className="w-3 h-3" style={{ color: "#a855f7" }} />
                  Market Comparison
                </div>
                <p className="text-base font-medium leading-relaxed" style={{ color: "#e2d9f3" }}>{aiResult.insight}</p>
                <div className="mt-3 text-[0.7rem] flex items-center gap-1.5" style={{ color: "#6b7280" }}>
                  <Info className="w-3 h-3" />
                  Matched with historical {aiResult.matchType} data
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {aiResult.suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="text-[0.65rem] uppercase tracking-wider font-semibold mb-1" style={{ color: "#6b7280" }}>
                  Suggestions for Improvement
                </div>
                {aiResult.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-[rgba(168,85,247,0.08)]"
                    style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.08)" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "#a855f7" }} />
                    <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>{s}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
