import React, { useState, useEffect } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Loader2, Search, Menu } from 'lucide-react';
import { tsParticles } from '@tsparticles/engine';

export function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [init, setInit] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    loadSlim(tsParticles).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
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
    <div className="relative min-h-[100dvh] w-full bg-[#040404] overflow-hidden font-sans text-slate-200">
      {/* Background Image & Vignette */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#040404]" />
      </div>

      {/* Custom Cursor/Spotlight */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.04), transparent 40%)`
        }}
      />

      {/* Particles Background */}
      {init && (
        <div className="absolute inset-0 z-0">
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
                  repulse: { distance: 150, duration: 0.4 },
                },
              },
              particles: {
                color: { value: "#ffffff" },
                links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 },
                move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 0.4, straight: false },
                number: { density: { enable: true, width: 1920, height: 1080 }, value: 60 },
                opacity: { value: 0.2 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 2 } },
              },
              detectRetina: true,
            }}
          />
        </div>
      )}

      {/* Main Content Wrapper (dims when drawer opens) */}
      <div className={`relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] min-h-[100dvh] flex flex-col ${drawerOpen ? 'brightness-50' : 'brightness-100'}`}>
        
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-8 backdrop-blur-md bg-black/40 border-b border-white/10 z-20">
          <div className="text-white font-bold text-lg tracking-[0.2em] uppercase">Phishield</div>
          <div className="flex items-center gap-4">
            <button className="text-white p-2 border border-white/10 hover:bg-white/5 transition-colors rounded-none">
              <Search className="w-4 h-4" />
            </button>
            <button className="text-white p-2 border border-white/10 hover:bg-white/5 transition-colors rounded-none mr-2">
              <Menu className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setDrawerOpen(true)}
              className="bg-white text-black hover:bg-gray-200 px-6 py-2 text-sm font-semibold tracking-wide transition-colors rounded-none"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col justify-center items-center relative px-4 text-center">
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
            <DecryptHeadline text="Intelligence for the Modern Enterprise." />
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl text-slate-400 mt-6 font-normal max-w-2xl text-center"
            >
              Correlate CDR, IPDR, and financial ledgers in milliseconds.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-8 text-gray-500"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium">SCROLL TO EXPLORE</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-4 h-4 stroke-[1.5]" />
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <GetStartedDrawer onClose={() => setDrawerOpen(false)} onLogin={onLogin} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Highly staggered letter reveal simulating decryption
const DecryptHeadline = ({ text }: { text: string }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.2 },
    },
  };

  const child = {
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)", 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } 
    },
    hidden: { 
      opacity: 0, 
      y: 10, 
      filter: "blur(4px)" 
    },
  };

  return (
    <motion.h1
      className="text-5xl md:text-7xl lg:text-8xl font-medium text-white tracking-tighter mb-4 text-balance hyphens-none"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} className="inline-block">
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};

const GetStartedDrawer = ({ onClose, onLogin }: { onClose: () => void, onLogin: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      setTimeout(onLogin, 600); // transition to dashboard after drawer closes
    }, 1500);
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
      {/* Backdrop overlay for catching clicks outside */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-40 bg-black/80 backdrop-brightness-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-md lg:max-w-xl bg-white z-50 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col text-slate-900 border-l border-white/10"
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 md:p-14 flex flex-col">
          {/* Close Button Top Left */}
          <div className="mb-12">
            <button 
              onClick={onClose}
              aria-label="Close panel"
              className="p-1 text-slate-400 hover:text-black transition-transform duration-300 hover:rotate-90"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          <div className="mb-12">
            <motion.h2 
              id="drawer-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl md:text-3xl font-medium tracking-tighter"
            >
              Request Phishield Access
            </motion.h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8 flex-1">
            {formFields.map((field, i) => (
              <motion.div 
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.08), duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col group"
              >
                <label htmlFor={field.id} className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type={field.type}
                  id={field.id}
                  required={field.required}
                  className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none py-2 text-black text-sm transition-colors rounded-none"
                />
              </motion.div>
            ))}

            <div className="mt-auto pt-10 pb-4">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (formFields.length * 0.08), duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-black text-white py-4 font-semibold tracking-[0.1em] uppercase text-xs transition-all duration-300 border border-black hover:bg-white hover:text-black flex justify-center items-center group rounded-none active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin relative z-10 text-current" />
                ) : (
                  <span className="relative z-10">Submit Request</span>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};
