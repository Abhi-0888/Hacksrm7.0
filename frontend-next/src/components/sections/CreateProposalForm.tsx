"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { useWeb3 } from "@/providers/Web3Provider";
import { useRouter } from "next/navigation";
import { Rocket, Sparkles, AlertCircle, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PosterUpload from "@/components/ui/PosterUpload";

export const CreateProposalForm = () => {
    const { submitProposal, txPending } = useApp();
    const { account } = useWeb3();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        recipient: "",
        duration: "86400", // Default 24 hours in seconds
        venue: "",
        host: "",
    });

    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | undefined>(undefined);

    // AI State
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<any | null>(null);

    // Auto-fill recipient
    useEffect(() => {
        if (account && !formData.recipient) {
            setFormData(prev => ({ ...prev, recipient: account }));
        }
    }, [account, formData.recipient]);

    const handlePosterChange = (file: File, previewUrl: string) => {
        setPosterFile(file);
        setPosterPreviewUrl(previewUrl);
    };

    const handlePosterRemove = () => {
        if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
        setPosterFile(null);
        setPosterPreviewUrl(undefined);
    };

    const handleField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAIAnalysis = async () => {
        if (!formData.title || !formData.description) {
            setAiError("Please fill in at least the Event Title and Description before analyzing.");
            return;
        }

        setAiLoading(true);
        setAiError(null);
        setAiResult(null);

        const prompt = `You are an expert event strategist, investor proposal analyst, and behavioral psychology specialist. Analyze this event proposal and complete ALL 5 tasks. Return ONLY the JSON object — no commentary outside JSON.

        INPUTS:
        Event Title: ${formData.title}
        Organizer: ${formData.host || 'Not specified'}
        Venue: ${formData.venue || 'Not specified'}
        Funding Requested: ${formData.amount ? formData.amount + ' QUAI' : 'Not specified'}
        Description: ${formData.description}

        TASK 1 – Rewrite the description to be clear, professional, persuasive, and informative (100–180 words). Preserve original intent. Do NOT invent facts.
        TASK 2 – Write a 1-2 sentence preview card summary.
        TASK 3 – Score the ORIGINAL description: clarity (0–100), credibility (0–100), excitement (0–100), completeness (0–100), funding_probability (0–100).
        TASK 4 – Analyze psychological influence on voters/funders.
        TASK 5 – List specific weaknesses and missing information.

        Return ONLY this JSON structure exactly:
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
            // Use Next.js server route or frontend configured proxy ideally, 
            // but keeping original logic for direct OpenRouter call.
            const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

            if (!apiKey) throw new Error("AI API Key not configured.");

            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Event Horizon Proposal Intelligence',
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.0-flash-exp:free', // Fallback to a wider free tier
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.4,
                    // response_format: { type: 'json_object' } removed to prevent 400 Bad Request
                }),
            });

            if (!res.ok) throw new Error(`OpenRouter Error: ${res.status}`);
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content || '{}';
            const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            setAiResult(JSON.parse(cleaned));

        } catch (err: any) {
            console.error('AI Analysis failed:', err);
            setAiError(err.message || "Intelligence synchronization failed.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleDeploy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return;

        // Simulating IPFS CID with metadata prefix for now as per legacy specs
        const posterRef = posterFile ? `[poster:${posterFile.name}]` : '';
        const ipfsStr = `${posterRef}VENUE:${formData.venue}|HOST:${formData.host}|${formData.description}`;
        const finalCID = ipfsStr.slice(0, 46) || 'QmPlaceholder46BytesLengthMustBeExactForTest';

        const success = await submitProposal(
            formData.title,
            finalCID,
            Number(formData.duration)
        );

        if (success) {
            handlePosterRemove();
            router.push("/proposals");
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="mb-12">
                <div className="font-mono text-[0.62rem] text-primary tracking-[0.25em] uppercase mb-3 flex items-center gap-2">
                    <Cpu size={14} className="animate-pulse flex-shrink-0" />
                    On-Chain Deployment Suite
                </div>
                <h2 className="font-display text-5xl md:text-7xl tracking-wide uppercase mb-4">
                    CREATE A <em className="text-primary not-italic">PROPOSAL</em>
                </h2>
                <p className="font-ui text-muted text-sm md:text-base font-light max-w-2xl leading-relaxed">
                    Submit new events to the Quai Network decentralized ledger. Leverage the <span className="text-foreground">Flash Intelligence</span> engine to optimize your proposal for maximum consensus probability.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

                {/* ── Main Form ── */}
                <form onSubmit={handleDeploy} className="space-y-8">

                    <div className="bg-panel border border-border p-6 md:p-8 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />

                        {/* Event Poster */}
                        <div className="space-y-4">
                            <label className="font-mono text-[0.62rem] text-primary uppercase tracking-widest flex justify-between">
                                Event Poster <span className="text-muted opacity-50">Optional</span>
                            </label>
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <PosterUpload
                                    value={posterPreviewUrl}
                                    onChange={handlePosterChange}
                                    onRemove={handlePosterRemove}
                                />
                                <div className="space-y-2 mt-2">
                                    <p className="font-ui text-sm text-foreground uppercase tracking-widest border-l-2 border-primary pl-3">Visual Identity</p>
                                    <p className="font-mono text-[0.6rem] text-muted max-w-xs leading-relaxed">Upload a defining image for your event. This asset will be permanently linked to your proposal&apos;s metadata payload.</p>
                                </div>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-6 pt-6 border-t border-border">
                            <div className="space-y-2">
                                <label className="font-mono text-[0.62rem] text-primary uppercase tracking-widest">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => handleField("title", e.target.value)}
                                    placeholder="e.g. Neo-Tokyo Hackathon &apos;26"
                                    className="w-full bg-bg2 border border-border p-4 font-mono text-[0.75rem] text-foreground outline-none focus:border-primary/40 transition-colors"
                                    disabled={txPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[0.62rem] text-primary uppercase tracking-widest flex justify-between">
                                    Strategic Blueprint *
                                </label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => handleField("description", e.target.value)}
                                    placeholder="Provide full operational context for the protocol voters..."
                                    className="w-full bg-bg2 border border-border p-4 font-mono text-[0.75rem] text-foreground outline-none focus:border-primary/40 transition-colors min-h-[160px] leading-relaxed resize-y"
                                    disabled={txPending}
                                />
                            </div>
                        </div>

                        {/* Context Matrix (Amount, Host, Venue) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                            <div className="space-y-2">
                                <label className="font-mono text-[0.62rem] text-muted uppercase tracking-widest">Sponsorship Target (QUAI)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.001"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => handleField("amount", e.target.value)}
                                        className="w-full bg-bg2 border border-border p-4 font-mono text-[0.75rem] text-foreground outline-none focus:border-primary/40 transition-colors"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[0.6rem] text-dim pointer-events-none">QUAI</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[0.62rem] text-muted uppercase tracking-widest">Fund Sink (Recipient)</label>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    value={formData.recipient}
                                    onChange={(e) => handleField("recipient", e.target.value)}
                                    className="w-full bg-bg2 border border-border p-4 font-mono text-[0.75rem] text-foreground outline-none focus:border-primary/40 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[0.62rem] text-muted uppercase tracking-widest">Physical/Virtual Venue</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sector 7 Auditorium"
                                    value={formData.venue}
                                    onChange={(e) => handleField("venue", e.target.value)}
                                    className="w-full bg-bg2 border border-border p-4 font-mono text-[0.75rem] text-foreground outline-none focus:border-primary/40 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-mono text-[0.62rem] text-muted uppercase tracking-widest">Host / Node</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Cybernetics Guild"
                                    value={formData.host}
                                    onChange={(e) => handleField("host", e.target.value)}
                                    className="w-full bg-bg2 border border-border p-4 font-mono text-[0.75rem] text-foreground outline-none focus:border-primary/40 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Ruleset */}
                        <div className="pt-6 border-t border-border space-y-4">
                            <label className="font-mono text-[0.62rem] text-primary uppercase tracking-widest">Consensus Duration</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: "12 Hours", value: "43200" },
                                    { label: "24 Hours", value: "86400" },
                                    { label: "3 Days", value: "259200" },
                                    { label: "1 Week", value: "604800" },
                                ].map((opt) => (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        onClick={() => handleField("duration", opt.value)}
                                        className={cn(
                                            "px-4 py-2 font-mono text-[0.65rem] uppercase tracking-widest border transition-all cursor-pointer",
                                            formData.duration === opt.value
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-bg2 text-muted hover:border-dim hover:text-foreground"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-10">
                            <button
                                type="button"
                                onClick={handleAIAnalysis}
                                disabled={aiLoading || txPending}
                                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 font-mono text-[0.7rem] uppercase tracking-widest border border-primary/30 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                            >
                                <Sparkles size={14} className={aiLoading ? "animate-spin" : ""} />
                                {aiLoading ? "Synchronizing AI..." : "Flash Intelligence"}
                            </button>

                            <button
                                type="submit"
                                disabled={txPending}
                                className="flex-[1.5] flex items-center justify-center gap-3 px-6 py-4 font-mono text-[0.7rem] uppercase tracking-widest border border-primary bg-primary text-background hover:bg-transparent hover:text-primary transition-all disabled:opacity-50"
                            >
                                {txPending ? (
                                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Rocket size={14} />
                                )}
                                {txPending ? "Transmitting to Quai..." : "Deploy _Protocol"}
                            </button>
                        </div>

                        {/* Error Displays */}
                        <AnimatePresence>
                            {aiError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 p-4 border border-danger/20 bg-danger/5 flex items-start gap-3"
                                >
                                    <AlertCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
                                    <span className="font-mono text-xs text-danger uppercase leading-relaxed">{aiError}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </form>

                {/* ── Context / AI Side Panel ── */}
                <aside className="space-y-6">
                    {/* Execution Parameters Box */}
                    <div className="bg-panel border border-border p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-20">
                            <Cpu size={24} />
                        </div>
                        <h4 className="font-mono text-[0.65rem] text-primary uppercase tracking-widest mb-4">Execution Guard</h4>
                        <div className="space-y-3 font-mono text-[0.55rem] text-muted uppercase">
                            <div className="flex justify-between border-b border-border pb-1">
                                <span>Target Network</span>
                                <span className="text-foreground">Quai (Cyprus-1)</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-1">
                                <span>Logic Engine</span>
                                <span className="text-foreground">EventDAO_Core</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-1">
                                <span>Consensus Type</span>
                                <span className="text-foreground">Binary (Yes/No)</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-1">
                                <span>Gas Escrow</span>
                                <span className="text-primary">~0.01 QUAI</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Results */}
                    <AnimatePresence>
                        {aiResult && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-panel border border-primary/20 p-6 space-y-6"
                            >
                                <div className="border-b border-primary/20 pb-4">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <Sparkles size={16} />
                                        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold">Analysis Complete</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[0.6rem] text-muted uppercase">Influence Index</span>
                                        <span className={cn(
                                            "font-display text-3xl",
                                            aiResult.influence_analysis.overall_influence_score >= 80 ? "text-primary" :
                                                aiResult.influence_analysis.overall_influence_score >= 60 ? "text-accent" : "text-danger"
                                        )}>
                                            {aiResult.influence_analysis.overall_influence_score}
                                        </span>
                                    </div>
                                </div>

                                {/* Dimension Metrics */}
                                <div className="space-y-3">
                                    <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-muted mb-2">Vectors</p>
                                    {[
                                        { label: "Clarity", val: aiResult.scores.clarity, color: "bg-[#00f0ff]" },
                                        { label: "Excitement", val: aiResult.scores.excitement, color: "bg-[#ff003c]" },
                                        { label: "Credibility", val: aiResult.scores.credibility, color: "bg-[#b4f500]" },
                                    ].map(metric => (
                                        <div key={metric.label}>
                                            <div className="flex justify-between font-mono text-[0.55rem] uppercase mb-1 flex-row">
                                                <span className="text-foreground">{metric.label}</span>
                                                <span className="text-muted">{metric.val}%</span>
                                            </div>
                                            <div className="h-1 bg-border overflow-hidden">
                                                <motion.div
                                                    className={cn("h-full", metric.color)}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${metric.val}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Intel Summary */}
                                <div className="space-y-4 pt-4 border-t border-primary/10">
                                    <div className="bg-bg2 border border-border p-3">
                                        <p className="font-mono text-[0.6rem] text-muted uppercase mb-2">Strategic Rewrite</p>
                                        <p className="font-ui text-xs text-foreground font-light leading-relaxed">
                                            {aiResult.enhanced_description}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleField("description", aiResult.enhanced_description)}
                                        className="w-full py-2 border border-primary/30 font-mono text-[0.6rem] uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        Apply Enhancement
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </aside>

            </div>
        </div>
    );
};
