import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { CaseItem } from '../types/schema';

const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

interface CaseDeleteModalProps {
  isOpen: boolean;
  targetCase: CaseItem | null;
  bulkCases?: CaseItem[];
  onClose: () => void;
  onConfirm: () => void;
}

export const CaseDeleteModal: React.FC<CaseDeleteModalProps> = ({
  isOpen,
  targetCase,
  bulkCases,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const isBulk = Boolean(bulkCases && bulkCases.length > 0);
  const count = bulkCases?.length || (targetCase ? 1 : 0);

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE_SHARP }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(42, 36, 32, 0.55)',
            backdropFilter: 'blur(2px)',
          }}
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.25, ease: EASE_SHARP }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-case-title"
          style={{
            position: 'relative',
            zIndex: 10000,
            background: '#FFFFFF',
            border: '1px solid #DDD5CA',
            borderTop: '3px solid #B53924',
            borderRadius: 8,
            width: '100%',
            maxWidth: 440,
            margin: '0 20px',
            padding: '24px 26px',
            boxShadow: '0 8px 30px rgba(42, 36, 32, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 6,
                background: '#B5392415', border: '1px solid #B5392435',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 className="w-5 h-5 text-[#B53924]" />
              </div>
              <div>
                <span className="data-label" style={{ color: '#B53924', fontWeight: 600 }}>Permanent Action</span>
                <h3 id="delete-case-title" style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif', marginTop: 1 }}>
                  {isBulk ? `Delete ${count} Selected Cases` : 'Delete Case File'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{ border: 'none', background: 'transparent', color: '#7A6F63', cursor: 'pointer', padding: 2 }}
            >
              <X className="w-4 h-4 hover:text-[#2A2420]" />
            </button>
          </div>

          {/* Description */}
          <div style={{ fontSize: 12.5, color: '#4A4340', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
            {isBulk ? (
              <>
                Are you sure you want to delete <strong style={{ color: '#2A2420' }}>{count} selected case files</strong>? This will remove all associated graph relationships and anomalies from the active workspace. This cannot be undone.
              </>
            ) : targetCase ? (
              <>
                Delete <strong style={{ color: '#8C3D1A', fontFamily: 'IBM Plex Mono, monospace' }}>{targetCase.id}</strong> — <strong style={{ color: '#2A2420' }}>{targetCase.title}</strong>? This cannot be undone.
              </>
            ) : null}
          </div>

          {/* Warning Banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#FAF6F0', border: '1px solid #DDD5CA',
            borderRadius: 4, padding: '8px 12px',
          }}>
            <AlertTriangle className="w-4 h-4 text-[#D4854A] flex-shrink-0" />
            <span style={{ fontSize: 11, color: '#7A6F63' }}>
              You will have an undo window of 5 seconds to revert this deletion.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, paddingTop: 6 }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: 11.5 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                background: '#B53924',
                color: '#FFFFFF',
                border: '1px solid #B53924',
                borderRadius: 4,
                padding: '8px 18px',
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'background-color 150ms ease',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#8A2517'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#B53924'; }}
            >
              {isBulk ? `Delete ${count} Cases` : 'Delete Case'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
