"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWeb3 } from "@/providers/Web3Provider";
import { useSession, signIn, signOut } from "next-auth/react";

export const Navbar = () => {
    const pathname = usePathname();
    const { account, connect, disconnect, isConnected } = useWeb3();
    const { data: session, status } = useSession();

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Proposals", href: "/proposals" },
        { name: "Create Proposal", href: "/create" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-6 md:px-12 py-4 border-b border-primary/10 bg-background/90 backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-primary/40 group-hover:border-primary transition-colors">
                    <Image
                        src="/logo.jpeg"
                        alt="Event Horizon"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
                <span className="font-display text-2xl tracking-widest uppercase">
                    EVENT<em className="text-primary not-italic">HORIZON</em>
                </span>
            </Link>

            <ul className="hidden md:flex items-center gap-8 list-none">
                {navLinks.map((link) => (
                    <li key={link.name}>
                        <Link
                            href={link.href}
                            className={cn(
                                "font-mono text-[0.9rem] uppercase tracking-widest transition-colors before:content-['/_']",
                                pathname === link.href ? "text-primary" : "text-muted hover:text-primary"
                            )}
                        >
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-primary/20 bg-primary/5 font-mono text-[0.8rem] tracking-wider text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-fast" />
                    QUAI MAINNET
                </div>

                {/* Google OAuth Sign-In / Sign-Out */}
                {status === "loading" ? (
                    <div className="font-mono text-[0.65rem] px-4 py-2 text-muted animate-pulse">
                        ...
                    </div>
                ) : session ? (
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 font-mono text-[0.7rem] px-4 py-2 uppercase tracking-widest border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                        {session.user?.image && (
                            <Image
                                src={session.user.image}
                                alt="avatar"
                                width={20}
                                height={20}
                                className="rounded-full"
                            />
                        )}
                        <span className="hidden sm:inline max-w-[100px] truncate">
                            {session.user?.name?.split(" ")[0]}
                        </span>
                        <span className="text-[0.55rem] text-muted">✕</span>
                    </button>
                ) : (
                    <button
                        onClick={() => signIn("google")}
                        className="font-mono text-[0.7rem] px-4 py-2 uppercase tracking-widest border border-primary/40 text-primary hover:bg-primary/10 transition-all flex items-center gap-2"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign In
                    </button>
                )}

                {/* Wallet Connect */}
                <button
                    onClick={() => {
                        if (!session && !isConnected) {
                            alert("Please Sign In with Google before connecting your wallet.");
                            return;
                        }
                        isConnected ? disconnect() : connect();
                    }}
                    className={cn(
                        "font-mono text-[0.9rem] px-5 py-2 uppercase tracking-widest transition-all",
                        (!session && !isConnected)
                            ? "bg-bg2 text-muted border border-border cursor-not-allowed opacity-50"
                            : isConnected
                                ? "bg-primary text-background border border-primary"
                                : "border border-primary text-primary hover:bg-primary hover:text-background"
                    )}
                    disabled={!session && !isConnected}
                    title={(!session && !isConnected) ? "Google Sign-In Required" : ""}
                >
                    {isConnected ? (
                        <span className="flex items-center gap-2">
                            {account?.slice(0, 6)}...{account?.slice(-4)}
                        </span>
                    ) : (
                        "Connect Wallet"
                    )}
                </button>
            </div>
        </nav>
    );
};
