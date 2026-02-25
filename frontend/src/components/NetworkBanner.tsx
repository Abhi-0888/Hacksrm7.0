import { useWeb3 } from "@/providers/Web3Provider";
import { useApp } from "@/context/AppContext";
import { AlertCircle } from "lucide-react";

export function NetworkBanner() {
    const { error, isCorrectNetwork, switchToQuai } = useWeb3();
    const { contractError } = useApp();

    const displayError = error || contractError;

    if (!displayError && isCorrectNetwork) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-[9999] bg-destructive text-destructive-foreground p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">{displayError}</span>
            </div>
            {!isCorrectNetwork && (
                <button
                    onClick={() => switchToQuai()}
                    className="bg-background text-foreground px-4 py-1 rounded-md text-sm font-medium hover:opacity-90 grayscale shadow-sm"
                >
                    Switch to Quai {import.meta.env.VITE_CHAIN_ID || '9001'}
                </button>
            )}
        </div>
    );
}
