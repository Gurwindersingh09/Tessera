import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, animate } from 'framer-motion';
import {
  X,
  Loader2,
  ShieldCheck,
  FileClock,
  Lock,
  PhoneCall,
  Landmark,
  AlertTriangle,
  Fingerprint,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { tsParticles } from '@tsparticles/engine';
import { useTesseraStore } from '../store/useTesseraStore';
import { TesseraMark } from '../components/TesseraMark';
import { ToastContainer, ToastMessage } from '../components/Toast';

const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

const heroVideoSrc = "/videos/bg-video.mp4";
const defaultPosterUrl = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop";

interface LandingPageProps {
  videoUrl?: string;
  posterUrl?: string;
}

/* ─── Animated Number Counter in IBM Plex Mono ─── */
function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  decimals = 0
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState('0');
  const countMotion = useMotionValue(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasTriggered) {
        setHasTriggered(true);
        const controls = animate(countMotion, target, {
          duration: 1.4,
          ease: EASE_SHARP,
        });
        const unsubscribe = countMotion.on('change', (v) => {
          setDisplayValue(decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString());
        });
        return () => {
          controls.stop();
          unsubscribe();
        };
      }
    }, { threshold: 0.25 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [target, hasTriggered, decimals]);

  return (
    <span ref={containerRef} style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

export const LandingPage: React.FC<LandingPageProps> = ({
  videoUrl = heroVideoSrc,
  posterUrl = defaultPosterUrl
}) => {
  const navigate = useNavigate();
  const { hasRequestedAccess, setHasRequestedAccess } = useTesseraStore();
  const [init, setInit] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [launchTooltipVisible, setLaunchTooltipVisible] = useState(false);
  const [footerTooltipVisible, setFooterTooltipVisible] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const videoY = useTransform(scrollY, [0, 800], [0, 180]);

  const addToast = (title: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type, duration: 5000 }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogoClick = () => {
    window.location.href = '/';
  };

  const handleOpenRequestAccess = () => {
    setDrawerOpen(true);
  };

  const handleRequestAccessSuccess = () => {
    setHasRequestedAccess(true);
    addToast('Access request submitted. You can now launch the platform.', 'success');
  };

  const handleLaunchPlatform = () => {
    if (!hasRequestedAccess) {
      addToast('Request access first to launch the platform.', 'warning');
      return;
    }
    navigate('/dashboard');
  };

  const handleEnterWorkspace = () => {
    if (!hasRequestedAccess) {
      addToast('Request access first to launch the platform.', 'warning');
      return;
    }
    navigate('/dashboard');
  };

  useEffect(() => {
    loadSlim(tsParticles).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroThreshold = heroRef.current ? heroRef.current.offsetHeight - 90 : 600;
      setIsScrolledPastHero(window.scrollY > heroThreshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          setMousePos({ x: e.clientX, y: e.clientY });
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#FAF6F0] font-sans text-[#2A2420] selection:bg-[#F2D9C4] selection:text-[#6B2E12] overflow-x-hidden">

      {/* ─── Floating Wide Glassmorphic Nav Capsule with Scroll-Aware Contrast ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-3 sm:pt-4 pointer-events-none">
        <nav
          className="w-full max-w-[calc(100%-0.5rem)] sm:max-w-[calc(100%-1.5rem)] mx-auto h-14 sm:h-16 flex items-center justify-between px-5 md:px-8 rounded-2xl pointer-events-auto transition-all duration-300"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: isScrolledPastHero ? 'rgba(250, 246, 240, 0.78)' : 'rgba(255, 255, 255, 0.12)',
            border: isScrolledPastHero ? '1px solid rgba(42, 36, 32, 0.12)' : '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: isScrolledPastHero
              ? 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 8px 32px rgba(42, 36, 32, 0.08)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.2)',
            transition: 'background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease',
          }}
        >
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group"
            title="Tessera Home"
          >
            <TesseraMark size={28} />
            <div>
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isScrolledPastHero ? '#2A2420' : '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                textShadow: isScrolledPastHero ? 'none' : '0 1px 6px rgba(0, 0, 0, 0.4)',
                transition: 'color 250ms ease, text-shadow 250ms ease',
              }}>
                Tessera
              </span>
              <span
                className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase tracking-wider"
                style={{
                  color: isScrolledPastHero ? '#7A6F63' : '#E8E0D5',
                  textShadow: isScrolledPastHero ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.4)',
                  transition: 'color 250ms ease, text-shadow 250ms ease',
                }}
              >
                / Intelligence Core
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenRequestAccess}
              className="btn-accent"
              style={{ padding: '8px 16px', fontSize: '11px', borderRadius: 6 }}
            >
              Request Access
            </button>
          </div>
        </nav>
      </div>

      {/* ─── Hero Section (Full-Width with Looping Video + Black Tint + Textures) ─── */}
      <section
        ref={heroRef}
        className="grain-texture relative min-h-[100dvh] w-full flex flex-col justify-center items-center px-6 pt-24 pb-20 text-center overflow-hidden"
        style={{ background: '#FAF6F0' }}
      >
        {/* Layer 1 & 2: Bottommost Video + Black Tint Overlay + Textures */}
        <motion.div
          style={{ y: videoY }}
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        >
          {/* Bottommost Layer: Looping Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={posterUrl}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover scale-105"
            aria-hidden="true"
          >
            <source src={videoUrl} type="video/mp4" />
            <img
              src={posterUrl}
              alt="Background Fallback"
              className="w-full h-full object-cover opacity-15"
              style={{ filter: 'sepia(0.5)' }}
            />
          </video>

          {/* Tint Layer 1: Solid black overlay at ~70% opacity */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Tint Layer 2: Center radial dark vignette behind headline/text block */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 900px 520px at 50% 45%, rgba(10, 8, 6, 0.75) 0%, rgba(20, 16, 13, 0.35) 65%, transparent 100%)'
            }}
          />

          {/* Existing texture & warm overlay layers */}
          <div className="absolute inset-0 bg-[#FAF6F0]/15 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        </motion.div>

        {/* Cursor-Following Subtle Terracotta Glow (No harsh cyan) */}
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 hidden md:block"
          style={{
            background: `radial-gradient(480px circle at ${mousePos.x}px ${mousePos.y}px, rgba(196, 98, 45, 0.08), transparent 65%)`
          }}
        />

        {/* TSParticles Layer with Warm Tonal Palette */}
        {init && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <Particles
              id="tsparticles"
              options={{
                background: { color: { value: "transparent" } },
                fpsLimit: 60,
                interactivity: {
                  events: {
                    onHover: { enable: true, mode: "repulse" },
                  },
                  modes: {
                    repulse: { distance: 100, duration: 0.4 },
                  },
                },
                particles: {
                  color: { value: ["#C4622D", "#D4854A", "#E8B896", "#7A6F63"] },
                  links: { color: "#DDD5CA", distance: 130, enable: true, opacity: 0.25, width: 0.8 },
                  move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 0.3, straight: false },
                  number: { density: { enable: true, width: 1920, height: 1080 }, value: 45 },
                  opacity: { value: 0.35 },
                  shape: { type: "circle" },
                  size: { value: { min: 1, max: 2.2 } },
                },
                detectRetina: true,
              }}
            />
          </div>
        )}

        {/* Hero Foreground Content */}
        <div className={`relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center transition-all duration-700 ${drawerOpen ? 'opacity-40' : 'opacity-100'}`}>

          {/* Operational Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_SHARP }}
            className="inline-flex items-center gap-2 px-3.5 py-1 mb-6 border border-[#DDD5CA] bg-[#FFFFFF] rounded-full text-xs shadow-sm"
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D7A4A' }} />
            <span className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>
              Autonomous Cyber Telemetry v2.4
            </span>
          </motion.div>

          {/* Fraunces Serif Headline with Decrypt Character Entrance */}
          <DecryptHeadline text="Built to find what manual review misses." />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: EASE_SHARP }}
            style={{
              fontSize: 18,
              color: '#C9C0B4',
              maxWidth: 620,
              marginTop: 18,
              lineHeight: 1.55,
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.55)',
            }}
          >
            See the connections hidden across calls, transactions, and networks.
          </motion.p>

          {/* Action Buttons: Solid Terracotta Launch Platform + Outline Request Access */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: EASE_SHARP }}
            className="mt-10 flex flex-wrap justify-center items-center gap-4"
          >
            {/* Launch Platform Button: Gated by hasRequestedAccess */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <motion.button
                onClick={handleLaunchPlatform}
                onMouseEnter={() => { if (!hasRequestedAccess) setLaunchTooltipVisible(true); }}
                onMouseLeave={() => setLaunchTooltipVisible(false)}
                whileHover={hasRequestedAccess ? {
                  scale: 1.02,
                  backgroundColor: '#8C3D1A',
                  boxShadow: '0 4px 14px rgba(140, 61, 26, 0.28)',
                } : {}}
                whileTap={hasRequestedAccess ? { scale: 0.98 } : {}}
                style={{
                  border: hasRequestedAccess ? '1.5px solid #C4622D' : '1.5px solid #8F7E74',
                  background: hasRequestedAccess ? '#C4622D' : '#6B6056',
                  color: hasRequestedAccess ? '#FFFFFF' : '#DDD5CA',
                  opacity: hasRequestedAccess ? 1 : 0.6,
                  boxShadow: hasRequestedAccess ? '0 2px 8px rgba(196, 98, 45, 0.25)' : 'none',
                  padding: '12px 28px',
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  borderRadius: 4,
                  cursor: hasRequestedAccess ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease, box-shadow 150ms ease',
                  fontFamily: 'Inter, sans-serif',
                }}
                title={!hasRequestedAccess ? "Request access first to launch the platform." : undefined}
              >
                <span>Launch Platform</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {!hasRequestedAccess && launchTooltipVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                      background: '#2A2420',
                      color: '#FAF6F0',
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '5px 10px',
                      borderRadius: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      border: '1px solid #7A6F63',
                      pointerEvents: 'none',
                      zIndex: 30,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Request access first to launch the platform.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Request Access Button */}
            <button
              onClick={handleOpenRequestAccess}
              className="btn-ghost"
              style={{
                padding: '12px 26px',
                fontSize: 12,
                borderRadius: 4,
                background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(42,36,32,0.04)',
              }}
            >
              Request Access
            </button>
          </motion.div>
        </div>

        {/* Subtle Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-6 flex flex-col items-center gap-1.5 text-[#A89F93] pointer-events-none"
        >
          <span className="data-label" style={{ fontSize: '0.58rem', letterSpacing: '0.14em' }}>
            Scroll to Explore
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-[#7A6F63]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Below-the-Fold Section 1: Compliance Strip ──────────────── */}
      <section style={{ borderTop: '1px solid #DDD5CA', borderBottom: '1px solid #DDD5CA', background: '#F3EDE4', padding: '16px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE_SHARP }}
          className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4 md:gap-8"
        >
          {/* Badge 1 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 4,
            border: '1px solid #DDD5CA', background: '#FAF6F0',
          }}>
            <ShieldCheck className="w-4 h-4 text-[#C4622D]" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2A2420', fontFamily: 'Inter, sans-serif' }}>
              DPDP Act 2023 Compliant
            </span>
          </div>

          {/* Badge 2 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 4,
            border: '1px solid #DDD5CA', background: '#FAF6F0',
          }}>
            <FileClock className="w-4 h-4 text-[#8C3D1A]" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2A2420', fontFamily: 'Inter, sans-serif' }}>
              Access Fully Audit-Logged
            </span>
          </div>

          {/* Badge 3 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 4,
            border: '1px solid #DDD5CA', background: '#FAF6F0',
          }}>
            <Lock className="w-4 h-4 text-[#6B2E12]" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2A2420', fontFamily: 'Inter, sans-serif' }}>
              Role-Based Encryption
            </span>
          </div>
        </motion.div>
      </section>

      {/* ─── Below-the-Fold Section 2: Capability Highlights ─────────── */}
      <section style={{ padding: '64px 24px', background: '#FAF6F0', position: 'relative' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE_SHARP }}
            style={{ marginBottom: 36, textAlign: 'center' }}
          >
            <span className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>
              Forensic Capability Matrix
            </span>
            <h2 style={{ fontSize: 26, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif', marginTop: 4 }}>
              Specialized Telecom & Financial Investigation Modules
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              {
                icon: PhoneCall,
                iconColor: '#C4622D',
                title: "CDR/IPDR Correlation",
                desc: "Cross-match multi-carrier call logs, IMEI switches, and IP radius sessions.",
              },
              {
                icon: Landmark,
                iconColor: '#8C3D1A',
                title: "Financial Transaction Analysis",
                desc: "Map mule bank accounts, high-frequency fund layering, and UPI routes.",
              },
              {
                icon: AlertTriangle,
                iconColor: '#B53924',
                title: "Anomaly Detection",
                desc: "Real-time pattern deviation scoring, tower burst velocity, and syndicate flags.",
              },
              {
                icon: Fingerprint,
                iconColor: '#6B2E12',
                title: "Digital Footprint Reconstruction",
                desc: "Synthesize disparate logs into verifiable knowledge graph identities.",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: idx * 0.08, duration: 0.5, ease: EASE_SHARP }}
                  whileHover={{ y: -2, borderColor: '#C4622D' }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #DDD5CA',
                    borderRadius: 6,
                    padding: '20px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: '0 1px 3px rgba(42,36,32,0.03)',
                    transition: 'border-color 150ms, box-shadow 150ms',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 6,
                    background: '#F3EDE4', border: '1px solid #DDD5CA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon className="w-5 h-5" style={{ color: card.iconColor }} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#2A2420', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: 11.5, color: '#7A6F63', lineHeight: 1.45 }}>
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Below-the-Fold Section 3: Live Status Strip ─────────────── */}
      <section style={{ borderTop: '1px solid #DDD5CA', borderBottom: '1px solid #DDD5CA', background: '#F3EDE4', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE_SHARP }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {/* Stat 1 */}
          <div style={{ background: '#FAF6F0', border: '1px solid #DDD5CA', borderRadius: 6, padding: '14px 16px' }}>
            <div className="data-label" style={{ marginBottom: 4 }}>System Status</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3D7A4A' }} />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 600, color: '#3D7A4A' }}>
                Nominal
              </span>
            </div>
            <span style={{ fontSize: 9.5, color: '#7A6F63' }}>All services operational</span>
          </div>

          {/* Stat 2 */}
          <div style={{ background: '#FAF6F0', border: '1px solid #DDD5CA', borderRadius: 6, padding: '14px 16px' }}>
            <div className="data-label" style={{ marginBottom: 4 }}>Cases Processed</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 18, fontWeight: 600, color: '#8C3D1A' }}>
              <AnimatedCounter target={1284} />
            </div>
            <span style={{ fontSize: 9.5, color: '#7A6F63' }}>Active & cold archives</span>
          </div>

          {/* Stat 3 */}
          <div style={{ background: '#FAF6F0', border: '1px solid #DDD5CA', borderRadius: 6, padding: '14px 16px' }}>
            <div className="data-label" style={{ marginBottom: 4 }}>Last Ingestion Sync</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 600, color: '#C4622D' }}>
              2m ago
            </div>
            <span style={{ fontSize: 9.5, color: '#7A6F63' }}>Delta sync verified</span>
          </div>

          {/* Stat 4 */}
          <div style={{ background: '#FAF6F0', border: '1px solid #DDD5CA', borderRadius: 6, padding: '14px 16px' }}>
            <div className="data-label" style={{ marginBottom: 4 }}>Correlated Entities</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 18, fontWeight: 600, color: '#6B2E12' }}>
              <AnimatedCounter target={48620} />
            </div>
            <span style={{ fontSize: 9.5, color: '#7A6F63' }}>Indexed in graph</span>
          </div>
        </motion.div>
      </section>

      {/* ─── Below-the-Fold Section 4: Minimal Agency Footer ─────────── */}
      <footer style={{ padding: '24px 32px', background: '#FAF6F0', borderTop: '1px solid #DDD5CA', fontSize: 11, color: '#7A6F63' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#2A2420', fontWeight: 600 }}>
              Tessera Core v2.4.0-prod · Build 8820
            </div>
            <div style={{ fontSize: 10.5, color: '#7A6F63' }}>
              Deployed for State Cyber Crime Investigation Division · Authorized Law Enforcement Personnel Only
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <span
                onClick={handleEnterWorkspace}
                onMouseEnter={() => { if (!hasRequestedAccess) setFooterTooltipVisible(true); }}
                onMouseLeave={() => setFooterTooltipVisible(false)}
                style={{
                  cursor: hasRequestedAccess ? 'pointer' : 'not-allowed',
                  color: hasRequestedAccess ? '#C4622D' : '#A89F93',
                  opacity: hasRequestedAccess ? 1 : 0.65,
                  fontWeight: 500,
                  transition: 'color 150ms ease, opacity 150ms ease',
                }}
                className={hasRequestedAccess ? 'hover:underline' : ''}
                title={!hasRequestedAccess ? "Request access first to launch the platform." : undefined}
              >
                Enter Workspace →
              </span>
              <AnimatePresence>
                {!hasRequestedAccess && footerTooltipVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 6px)',
                      right: 0,
                      whiteSpace: 'nowrap',
                      background: '#2A2420',
                      color: '#FAF6F0',
                      fontSize: 10.5,
                      fontWeight: 500,
                      padding: '4px 8px',
                      borderRadius: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      border: '1px solid #7A6F63',
                      pointerEvents: 'none',
                      zIndex: 30,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Request access first to launch the platform.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span
              style={{
                cursor: 'default',
                color: '#7A6F63',
                userSelect: 'none',
              }}
            >
              Agency Helpdesk
            </span>
          </div>
        </div>
      </footer>

      {/* ─── Request Access Drawer ───────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <GetStartedDrawer
            onClose={() => setDrawerOpen(false)}
            onRequestSuccess={handleRequestAccessSuccess}
          />
        )}
      </AnimatePresence>

      {/* ─── Toast Notifications ─────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

/* ─── Fraunces Serif Decrypting Headline Effect (No mid-word split) ─── */
const DecryptHeadline = ({ text }: { text: string }) => {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.15 },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.65, ease: EASE_SHARP }
    },
    hidden: {
      opacity: 0,
      y: 10,
      filter: "blur(4px)"
    },
  };

  return (
    <motion.h1
      className="text-balance hyphens-none"
      style={{
        fontSize: 'clamp(2.4rem, 5.2vw, 4.5rem)',
        fontWeight: 600,
        color: '#F5EFE6',
        fontFamily: '"Fraunces", Georgia, serif',
        letterSpacing: '-0.02em',
        lineHeight: 1.15,
        maxWidth: 960,
        width: '100%',
        wordBreak: 'normal',
        overflowWrap: 'normal',
        textShadow: '0 2px 14px rgba(0, 0, 0, 0.65)',
      }}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wIndex) => (
        <span
          key={wIndex}
          className="inline-block whitespace-nowrap"
          style={{ marginRight: wIndex < words.length - 1 ? '0.28em' : 0 }}
        >
          {Array.from(word).map((letter, lIndex) => (
            <motion.span variants={child} key={lIndex} className="inline-block">
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
};

/* ─── Request Access Drawer with Warm Theme ──────────────────────────── */
const GetStartedDrawer = ({
  onClose,
  onRequestSuccess
}: {
  onClose: () => void;
  onRequestSuccess: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      onRequestSuccess();
    }, 600);
  };

  const formFields = [
    { id: 'firstName', label: 'First Name', type: 'text', required: true },
    { id: 'lastName', label: 'Last Name', type: 'text', required: true },
    { id: 'email', label: 'Official Agency Email Address', type: 'email', required: true },
    { id: 'department', label: 'Department / Jurisdiction', type: 'text', required: true },
    { id: 'badge', label: 'Govt ID / Badge Number', type: 'text', required: true },
    { id: 'justification', label: 'Justification for Access', type: 'text', required: true },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE_SHARP }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(42, 36, 32, 0.55)',
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.45, ease: EASE_SHARP }}
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '100%',
          maxWidth: 500,
          background: '#FAF6F0',
          zIndex: 70,
          boxShadow: '-4px 0 24px rgba(42, 36, 32, 0.15)',
          borderLeft: '1px solid #DDD5CA',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>Agency Credentials Verification</span>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#7A6F63', padding: 4 }}
            >
              <X className="w-5 h-5 hover:text-[#2A2420]" />
            </button>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2
              id="drawer-title"
              style={{ fontSize: 24, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif' }}
            >
              Request Tessera Access
            </h2>
            <p style={{ fontSize: 11.5, color: '#7A6F63', marginTop: 4 }}>
              Submit agency credentials for authorized investigative access.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {formFields.map((field, i) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + (i * 0.04), duration: 0.4, ease: EASE_SHARP }}
                style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
              >
                <label htmlFor={field.id} className="data-label" style={{ fontSize: '0.62rem', color: '#2A2420', fontWeight: 600 }}>
                  {field.label} {field.required && <span style={{ color: '#B53924' }}>*</span>}
                </label>
                <input
                  type={field.type}
                  id={field.id}
                  required={field.required}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #DDD5CA',
                    borderRadius: 4,
                    padding: '8px 10px',
                    fontSize: 12.5,
                    color: '#2A2420',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </motion.div>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: 20, paddingBottom: 10 }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-accent"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 11.5,
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span>Submit Authorized Access Request</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};
