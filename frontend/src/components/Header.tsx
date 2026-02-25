import { useState, useEffect, useRef } from "react";
import { Menu, X, Wallet, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "@/providers/Web3Provider";
import { useApp, NETWORKS } from "@/context/AppContext";

const NETWORK_LABELS: Record<string, string> = {
  'quai-cyprus1': 'Quai Cyprus-1',
  'quai-orchard': 'Quai Orchard',
  'sepolia': 'Sepolia',
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { account, walletType, isConnecting, disconnect, setWalletModalOpen } = useWeb3();
  const { network, setNetwork } = useApp();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsNetworkDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Proposals", to: "/dashboard" },
    { name: "Create", to: "/create" },
  ];

  const formatAddr = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ transition: "all 0.4s cubic-bezier(.4,0,.2,1)" }}>
      <div
        className="mx-4 mt-3 md:mx-6 rounded-2xl overflow-visible"
        style={{
          background: scrolled ? "rgba(12,12,20,0.82)" : "rgba(12,12,20,0.55)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(168,85,247," + (scrolled ? "0.22" : "0.12") + ")",
          boxShadow: scrolled
            ? "0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(168,85,247,0.08)"
            : "0 4px 24px rgba(0,0,0,0.3)",
          transition: "all 0.4s ease",
        }}
      >
        <div className="flex items-center justify-between px-5 py-3.5">

          {/* ── Logo ── */}
          <motion.div
            className="flex items-center gap-2.5 group cursor-pointer"
            onClick={() => navigate("/")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="relative w-9 h-9 flex items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7, #c026d3)",
                boxShadow: "0 0 18px rgba(168,85,247,0.45)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <span className="font-display text-lg font-700 text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
              Campus<span style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Choice</span>
            </span>
          </motion.div>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <motion.div key={link.name} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }}>
                <Link
                  to={link.to}
                  className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300"
                  style={{ color: "#9ca3af", fontFamily: "'Inter', sans-serif" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(168,85,247,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-2.5">

            {/* ── Network Selector Dropdown ── */}
            {account && (
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300"
                  style={{
                    background: "rgba(22,22,38,0.6)",
                    border: `1px solid ${isNetworkDropdownOpen ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.15)'}`,
                    boxShadow: isNetworkDropdownOpen ? '0 0 12px rgba(168,85,247,0.15)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isNetworkDropdownOpen) e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; }}
                  onMouseLeave={e => { if (!isNetworkDropdownOpen) e.currentTarget.style.borderColor = 'rgba(168,85,247,0.15)'; }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: network.startsWith('quai') ? '#a855f7' : '#34d399',
                      boxShadow: `0 0 8px ${network.startsWith('quai') ? 'rgba(168,85,247,0.6)' : 'rgba(52,211,153,0.6)'}`,
                    }}
                  />
                  <span className="text-xs font-medium" style={{ color: "#e2d9f3", fontFamily: "'Inter',sans-serif" }}>
                    {NETWORK_LABELS[network] || network}
                  </span>
                  <ChevronDown
                    className="w-3 h-3 transition-transform duration-200"
                    style={{
                      color: '#9ca3af',
                      transform: isNetworkDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {isNetworkDropdownOpen && (
                    <motion.div
                      className="absolute top-full mt-2 right-0 w-52 rounded-xl overflow-hidden z-[60]"
                      style={{
                        background: 'rgba(16,16,28,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(168,85,247,0.2)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(168,85,247,0.08)',
                      }}
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="py-1.5">
                        {Object.keys(NETWORKS).map((key) => (
                          <button
                            key={key}
                            onClick={() => { setNetwork(key); setIsNetworkDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2.5 transition-all duration-200"
                            style={{
                              color: network === key ? '#c084fc' : '#9ca3af',
                              background: network === key ? 'rgba(168,85,247,0.08)' : 'transparent',
                              fontFamily: "'Inter',sans-serif",
                            }}
                            onMouseEnter={e => {
                              if (network !== key) {
                                e.currentTarget.style.color = '#e2d9f3';
                                e.currentTarget.style.background = 'rgba(168,85,247,0.06)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (network !== key) {
                                e.currentTarget.style.color = '#9ca3af';
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                background: network === key
                                  ? (key.startsWith('quai') ? '#a855f7' : '#34d399')
                                  : 'rgba(100,100,130,0.4)',
                                boxShadow: network === key
                                  ? `0 0 6px ${key.startsWith('quai') ? 'rgba(168,85,247,0.5)' : 'rgba(52,211,153,0.5)'}`
                                  : 'none',
                              }}
                            />
                            {NETWORK_LABELS[key]}
                            {network === key && (
                              <span className="ml-auto text-[0.6rem] uppercase tracking-wider" style={{ color: '#a855f7' }}>
                                Active
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Wallet address / Connect */}
            {account ? (
              <div className="hidden lg:flex items-center gap-2">
                <span
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5"
                  style={{
                    background: "rgba(168,85,247,0.12)",
                    color: "#c084fc",
                    border: "1px solid rgba(168,85,247,0.25)",
                  }}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  {formatAddr(account)}
                  {walletType && (
                    <span className="ml-1 opacity-60 text-[0.6rem] uppercase">{walletType}</span>
                  )}
                </span>
                <button
                  onClick={disconnect}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1"
                  style={{
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.18)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                >
                  <LogOut className="w-3 h-3" /> Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setWalletModalOpen(true)}
                disabled={isConnecting}
                className="hidden lg:inline-flex btn-fancy"
                style={{ padding: "0.55rem 1.4rem", fontSize: "0.82rem", opacity: isConnecting ? 0.6 : 1 }}
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}

            {/* mobile toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 16px rgba(168,85,247,0.4)" }}
            >
              {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, maxHeight: 0 }}
              animate={{ opacity: 1, maxHeight: 400 }}
              exit={{ opacity: 0, maxHeight: 0 }}
              transition={{ duration: 0.35, ease: [.4, 0, .2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 pt-2 border-t border-[rgba(168,85,247,0.12)] flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
                    style={{ color: "#9ca3af" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(168,85,247,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "transparent"; }}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile network selector */}
                {account && (
                  <div className="mt-1 flex flex-col gap-0.5 px-2 py-2 rounded-xl" style={{ background: 'rgba(22,22,38,0.4)', border: '1px solid rgba(168,85,247,0.1)' }}>
                    <span className="text-[0.6rem] uppercase tracking-wider px-2 mb-1" style={{ color: '#6b7280', fontFamily: "'Inter',sans-serif" }}>
                      Network
                    </span>
                    {Object.keys(NETWORKS).map((key) => (
                      <button
                        key={key}
                        onClick={() => { setNetwork(key); setIsMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all"
                        style={{
                          color: network === key ? '#c084fc' : '#9ca3af',
                          background: network === key ? 'rgba(168,85,247,0.1)' : 'transparent',
                        }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{
                          background: network === key ? '#a855f7' : 'rgba(100,100,130,0.4)',
                          boxShadow: network === key ? '0 0 6px rgba(168,85,247,0.5)' : 'none',
                        }} />
                        {NETWORK_LABELS[key]}
                      </button>
                    ))}
                  </div>
                )}

                {/* mobile wallet */}
                {account ? (
                  <div className="mt-2 flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
                    <span className="text-xs font-mono" style={{ color: "#c084fc" }}>{formatAddr(account)}</span>
                    <button onClick={disconnect} className="text-xs font-semibold" style={{ color: "#ef4444" }}>
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setIsMenuOpen(false); setWalletModalOpen(true); }}
                    className="mt-2 btn-fancy w-full"
                    style={{ padding: "0.65rem 1rem", fontSize: "0.82rem" }}
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
