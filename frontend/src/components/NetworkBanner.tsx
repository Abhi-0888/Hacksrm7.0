import { useWeb3 } from "@/providers/Web3Provider";
import { useApp } from "@/context/AppContext";
import { AlertTriangle, Wifi } from "lucide-react";

export function NetworkBanner() {
    const { error, isCorrectNetwork, switchToQuai, chainId } = useWeb3();
    const { contractError } = useApp();

    const displayError = error || contractError;

    if (!displayError && isCorrectNetwork) return null;

    return (
        <div
            className="fixed top-0 left-0 w-full z-[9999] flex items-center justify-between px-5 py-2.5"
            style={{
                background: "rgba(12,12,22,0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(168,85,247,0.25)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 30px rgba(168,85,247,0.06)",
            }}
        >
            <div className="flex items-center gap-2.5">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}
                >
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
                </div>
                <span
                    className="text-sm font-medium"
                    style={{ color: "#e2d9f3", fontFamily: "'Inter', sans-serif" }}
                >
                    {displayError || "Please switch your wallet to Quai Testnet (9001)."}
                    {!isCorrectNetwork && !displayError && (
                        <span style={{ color: "#9ca3af" }}>
                            {" "}Current:{" "}
                            <span style={{ color: "#f87171", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem" }}>
                                {chainId || "Unknown"}
                            </span>
                        </span>
                    )}
                </span>
            </div>
            {!isCorrectNetwork && (
                <button
                    onClick={() => switchToQuai()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 flex-shrink-0"
                    style={{
                        background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                        color: "#fff",
                        border: "none",
                        boxShadow: "0 0 16px rgba(168,85,247,0.35)",
                        fontFamily: "'Syne', sans-serif",
                        letterSpacing: "0.03em",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(168,85,247,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 16px rgba(168,85,247,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                    <Wifi className="w-3 h-3" />
                    Switch to Quai {import.meta.env.VITE_CHAIN_ID || '9001'}
                </button>
            )}
        </div>
    );
}
