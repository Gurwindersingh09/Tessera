import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhishieldStore } from '../store/usePhishieldStore';
import { motion } from 'framer-motion';

const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: EASE_SHARP },
  }),
};

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { addCase, pushNavHistory } = usePhishieldStore();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [investigator, setInvestigator] = useState('R. Okafor');
  const [status, setStatus] = useState<'active' | 'flagged' | 'closed'>('active');

  useEffect(() => {
    pushNavHistory({ id: 'new-case', label: 'New Case', path: '/new-case', depth: 1 });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCase({
      title,
      priority,
      investigator,
      status,
      entityCount: 1,
      anomalyCount: 0,
    });

    navigate('/dashboard');
  };

  return (
    <div className="grain-texture" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FAF6F0', height: '100vh', overflowY: 'auto' }}>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_SHARP }}
        style={{ padding: '18px 24px 14px', borderBottom: '1px solid #DDD5CA', position: 'relative', zIndex: 1 }}
      >
        <div className="data-label" style={{ marginBottom: 4 }}>Phishield / New Case</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#2A2420', letterSpacing: '-0.01em', fontFamily: '"Fraunces", Georgia, serif' }}>
            Initialize New Investigation
          </h1>
          <button className="btn-ghost" onClick={() => navigate('/dashboard')}>← Cancel</button>
        </div>
      </motion.header>

      <div style={{ padding: '32px 24px', maxWidth: 600, position: 'relative', zIndex: 1 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <motion.div
            custom={0} variants={fadeInUp} initial="hidden" animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <label className="data-label">Case Title / Operation Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Operation Vanguard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 13, borderRadius: 4 }}
            />
          </motion.div>

          <motion.div
            custom={1} variants={fadeInUp} initial="hidden" animate="visible"
            style={{ display: 'flex', gap: 16 }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="data-label">Priority</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as any)}
                style={{ padding: '8px 12px', fontSize: 13, borderRadius: 4 }}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="data-label">Initial Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)}
                style={{ padding: '8px 12px', fontSize: 13, borderRadius: 4 }}
              >
                <option value="active">Active</option>
                <option value="flagged">Flagged</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </motion.div>

          <motion.div
            custom={2} variants={fadeInUp} initial="hidden" animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <label className="data-label">Lead Investigator</label>
            <input
              type="text"
              value={investigator}
              onChange={(e) => setInvestigator(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 13, borderRadius: 4 }}
            />
          </motion.div>

          <motion.div
            custom={3} variants={fadeInUp} initial="hidden" animate="visible"
            style={{ display: 'flex', gap: 12, marginTop: 12 }}
          >
            <button type="submit" className="btn-accent" style={{ padding: '10px 24px' }}>
              Create Case File
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};
