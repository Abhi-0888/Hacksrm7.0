import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Rocket, Sparkles, Link as LinkIcon, AlertCircle, TrendingUp, Info, ArrowLeft, Wallet } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletConnectModal from "@/components/WalletConnectModal";
import PosterUpload from "@/components/PosterUpload";
import { useWeb3 } from "@/providers/Web3Provider";
import { useApp } from "@/context/AppContext";
import { compressImage } from "@/services/posterStore";

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

  // Poster state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | undefined>(undefined);

  const handlePosterChange = (file: File, previewUrl: string) => {
    setPosterFile(file);
    setPosterPreviewUrl(previewUrl);
  };

  const handlePosterRemove = () => {
    if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
    setPosterFile(null);
    setPosterPreviewUrl(undefined);
  };

  // Placeholder hook: uploadPoster(file) -> IPFS URL (wire in real IPFS later)
  const uploadPoster = async (_file: File): Promise<string> => {
    // TODO: replace with real IPFS/Pinata upload
    return 'ipfs://placeholder';
  };
  void uploadPoster; // suppress unused warning until integrated

  // Auto-fill recipient with connected wallet
  useEffect(() => {
    if (account) {
      setFormData(prev => ({ ...prev, recipient: account }));
    }
  }, [account]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    enhanced_description: string;
    summary: string;
    scores: {
      clarity: number;
      credibility: number;
      excitement: number;
      completeness: number;
      funding_probability: number;
    };
    influence_analysis: {
      overall_influence_score: number;
      reader_perception: string;
      will_they_trust_it: string;
      will_they_feel_excited: string;
      will_they_understand_value: string;
      strengths: string[];
      weaknesses: string[];
    };
    improvement_suggestions: string[];
    missing_information: string[];
  } | null>(null);

  const handleAIAnalysis = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in at least the Event Title and Description before analyzing.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    const prompt = `You are an expert event strategist, investor proposal analyst, and behavioral psychology specialist.

Analyze this event proposal and complete ALL 5 tasks. Return ONLY the JSON object — no commentary outside JSON.

INPUTS:
Event Title: ${formData.title}
Organizer: ${formData.host || 'Not specified'}
Venue: ${formData.venue || 'Not specified'}
Funding Requested: ${formData.amount ? formData.amount + ' ETH' : 'Not specified'}
Description: ${formData.description}

TASK 1 – Rewrite the description to be clear, professional, persuasive, and informative (100–180 words). Preserve original intent. Do NOT invent facts.
TASK 2 – Write a 1-2 sentence preview card summary.
TASK 3 – Score the ORIGINAL description: clarity (0–100), credibility (0–100), excitement (0–100), completeness (0–100), funding_probability (0–100).
TASK 4 – Analyze psychological influence on voters/funders.
TASK 5 – List specific weaknesses and missing information.

Return ONLY this JSON structure:
{
  "enhanced_description": "100-180 word rewrite",
  "summary": "1-2 sentence summary",
  "scores": { "clarity": 0, "credibility": 0, "excitement": 0, "completeness": 0, "funding_probability": 0 },
  "influence_analysis": {
    "overall_influence_score": 0,
    "reader_perception": "",
    "will_they_trust_it": "",
    "will_they_feel_excited": "",
    "will_they_understand_value": "",
    "strengths": [],
    "weaknesses": []
  },
  "improvement_suggestions": [],
  "missing_information": []
}`;

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) throw new Error('VITE_OPENROUTER_API_KEY is not set in your .env file');

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Event Horizon AI Proposal Analyzer',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const raw: string = data.choices?.[0]?.message?.content || '{}';
      // Strip possible markdown code fences
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleaned);
      setAiResult(parsed);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAiError(err.message || 'AI analysis failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    // Layer 5: compress poster using canvas API (no new packages)
    let posterDataUrl: string | undefined;
    if (posterFile) {
      try {
        posterDataUrl = await compressImage(posterFile);
      } catch (err) {
        console.warn('Poster compression failed, submitting without poster:', err);
      }
    }

    const posterRef = posterDataUrl ? `[poster:${posterFile!.name}]` : '';
    const ipfsCID = (posterRef + formData.description).slice(0, 46) || 'QmPlaceholder';
    const success = await submitProposal(formData.title, ipfsCID, Number(formData.duration), posterDataUrl);
    if (success) {
      handlePosterRemove();
      navigate('/dashboard');
    }
  };

  const handleField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

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

      <main className="relative z-10 pt-40 pb-24 px-5 max-w-4xl mx-auto">
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

              {/* ── EVENT POSTER SECTION ── */}
              <div className="space-y-3">
                <label className="text-sm font-medium pl-1" style={{ color: '#d1d5db' }}>
                  Event Poster
                  <span className="ml-2 text-[0.68rem] font-normal" style={{ color: '#4a4a5e' }}>Optional</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <PosterUpload
                    value={posterPreviewUrl}
                    onChange={handlePosterChange}
                    onRemove={handlePosterRemove}
                  />
                  <div className="flex-1 flex flex-col justify-center gap-2 pt-1">
                    <p className="text-sm font-semibold" style={{ color: '#d1d5db', fontFamily: "'Syne',sans-serif" }}>
                      Add a visual identity
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: '#4a4a5e', fontFamily: "'Inter',sans-serif" }}>
                      Upload a square poster image for your event. It will appear on your proposal card and the description page. PNG, JPG, or WEBP · Max 5 MB.
                    </p>
                    {posterFile && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                        style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                        ✓ {posterFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Divider ── */}
              <div style={{ borderTop: '1px solid rgba(168,85,247,0.08)' }} />

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

        {/* ── AI Error ── */}
        {aiError && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 flex items-start gap-3 my-2"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
            <p className="text-sm" style={{ color: '#f87171' }}>{aiError}</p>
          </motion.div>
        )}

        {/* ── AI Analysis Result ── */}
        {aiResult && (
          <motion.div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(16,16,28,0.6)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(168,85,247,0.15)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 px-8 py-6" style={{ borderBottom: '1px solid rgba(168,85,247,0.1)', background: 'rgba(168,85,247,0.04)' }}>
              <div className="p-3 rounded-2xl" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <Sparkles className="w-6 h-6" style={{ color: '#a855f7' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>AI Proposal Intelligence</h3>
                <p className="text-xs mt-1" style={{ color: '#7a7a8e' }}>5-dimension expert analysis · Powered by Gemini Flash</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold" style={{ fontFamily: "'Syne',sans-serif", color: aiResult.influence_analysis.overall_influence_score >= 70 ? '#34d399' : aiResult.influence_analysis.overall_influence_score >= 50 ? '#fbbf24' : '#f87171' }}>
                  {aiResult.influence_analysis.overall_influence_score}
                </div>
                <div className="text-[0.65rem] uppercase tracking-wider" style={{ color: '#6b7280' }}>Influence Score</div>
              </div>
            </div>

            <div className="p-8 space-y-8">

              {/* SECTION 1: Score bars */}
              <div>
                <div className="text-[0.65rem] uppercase tracking-widest font-bold mb-4" style={{ color: '#6b7280', letterSpacing: '0.1em' }}>📊 Dimension Scores</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
                  {([
                    { key: 'clarity',            label: 'Clarity',             color: '#60a5fa' },
                    { key: 'credibility',        label: 'Credibility',         color: '#a78bfa' },
                    { key: 'excitement',         label: 'Excitement',          color: '#f472b6' },
                    { key: 'completeness',       label: 'Completeness',        color: '#34d399' },
                    { key: 'funding_probability',label: 'Funding Probability', color: '#fbbf24' },
                  ] as const).map(({ key, label, color }) => {
                    const val = aiResult.scores[key];
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span style={{ color: '#d1d5db' }}>{label}</span>
                          <span style={{ color }}>{val}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Summary + Reader Perception */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(10,10,18,0.6)', border: '1px solid rgba(168,85,247,0.1)' }}>
                  <div className="text-[0.65rem] uppercase tracking-widest font-bold mb-3" style={{ color: '#6b7280' }}>📋 Preview Summary</div>
                  <p className="text-sm leading-relaxed" style={{ color: '#e2d9f3', fontFamily: "'Inter',sans-serif" }}>{aiResult.summary}</p>
                </div>
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(10,10,18,0.6)', border: '1px solid rgba(168,85,247,0.1)' }}>
                  <div className="text-[0.65rem] uppercase tracking-widest font-bold mb-3" style={{ color: '#6b7280' }}>🧠 Reader Perception</div>
                  <p className="text-sm leading-relaxed" style={{ color: '#e2d9f3', fontFamily: "'Inter',sans-serif" }}>{aiResult.influence_analysis.reader_perception}</p>
                </div>
              </div>

              {/* SECTION 3: Psychological Influence */}
              <div>
                <div className="text-[0.65rem] uppercase tracking-widest font-bold mb-4" style={{ color: '#6b7280' }}>🎯 Psychological Influence</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { q: 'Will They Trust It?',         a: aiResult.influence_analysis.will_they_trust_it,         icon: '🔐' },
                    { q: 'Will They Feel Excited?',     a: aiResult.influence_analysis.will_they_feel_excited,     icon: '⚡' },
                    { q: 'Will They Understand Value?', a: aiResult.influence_analysis.will_they_understand_value, icon: '💡' },
                  ].map(({ q, a, icon }) => (
                    <div key={q} className="p-4 rounded-2xl" style={{ background: 'rgba(10,10,18,0.5)', border: '1px solid rgba(168,85,247,0.08)' }}>
                      <div className="text-base mb-2">{icon}</div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-wider mb-2" style={{ color: '#a855f7' }}>{q}</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#9ca3af', fontFamily: "'Inter',sans-serif" }}>{a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Enhanced Description */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[0.65rem] uppercase tracking-widest font-bold" style={{ color: '#6b7280' }}>✨ AI-Enhanced Description</div>
                  <button
                    type="button"
                    onClick={() => {
                      handleField('description', aiResult.enhanced_description);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; }}
                  >
                    <Sparkles className="w-3 h-3" /> Use This Description
                  </button>
                </div>
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(10,10,18,0.6)', border: '1px solid rgba(168,85,247,0.12)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: '#e2d9f3', fontFamily: "'Inter',sans-serif", lineHeight: 1.75 }}>
                    {aiResult.enhanced_description}
                  </p>
                </div>
              </div>

              {/* SECTION 5: Strengths / Weaknesses / Suggestions / Missing Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                {aiResult.influence_analysis.strengths?.length > 0 && (
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-widest font-bold mb-3" style={{ color: '#34d399' }}>✅ Strengths</div>
                    <div className="space-y-2">
                      {aiResult.influence_analysis.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.1)' }}>
                          <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#34d399' }} />
                          <p className="text-xs leading-relaxed" style={{ color: '#d1d5db' }}>{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement Suggestions */}
                {aiResult.improvement_suggestions?.length > 0 && (
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-widest font-bold mb-3" style={{ color: '#fbbf24' }}>💡 Improvement Suggestions</div>
                    <div className="space-y-2">
                      {aiResult.improvement_suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)' }}>
                          <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#fbbf24' }} />
                          <p className="text-xs leading-relaxed" style={{ color: '#d1d5db' }}>{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {aiResult.influence_analysis.weaknesses?.length > 0 && (
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-widest font-bold mb-3" style={{ color: '#f87171' }}>⚠ Weaknesses</div>
                    <div className="space-y-2">
                      {aiResult.influence_analysis.weaknesses.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.1)' }}>
                          <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#f87171' }} />
                          <p className="text-xs leading-relaxed" style={{ color: '#d1d5db' }}>{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Info */}
                {aiResult.missing_information?.length > 0 && (
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-widest font-bold mb-3" style={{ color: '#60a5fa' }}>📌 Missing Information</div>
                    <div className="space-y-2">
                      {aiResult.missing_information.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.1)' }}>
                          <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#60a5fa' }} />
                          <p className="text-xs leading-relaxed" style={{ color: '#d1d5db' }}>{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
