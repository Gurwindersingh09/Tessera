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
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
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
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderTop: '3px solid var(--color-status-flagged)',
            borderRadius: 8,
            width: '100%',
            maxWidth: 440,
            margin: '0 20px',
            padding: '24px 26px',
            boxShadow: 'var(--shadow-dropdown)',
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
                background: 'var(--color-status-flagged-bg)', border: '1px solid var(--color-status-flagged-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 className="w-5 h-5 text-[var(--color-status-flagged)]" />
              </div>
              <div>
                <span className="data-label" style={{ color: 'var(--color-status-flagged)', fontWeight: 600 }}>Permanent Action</span>
                <h3 id="delete-case-title" style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif', marginTop: 1 }}>
                  {isBulk ? `Delete ${count} Selected Cases` : 'Delete Case File'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{ border: 'none', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 2 }}
            >
              <X className="w-4 h-4 hover:text-[var(--color-text-primary)]" />
            </button>
          </div>

          {/* Description */}
          <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
            {isBulk ? (
              <>
                Are you sure you want to delete <strong style={{ color: 'var(--color-text-primary)' }}>{count} selected case files</strong>? This will remove all associated graph relationships and anomalies from the active workspace. This cannot be undone.
              </>
            ) : targetCase ? (
              <>
                Delete <strong style={{ color: '#C4622D', fontFamily: 'IBM Plex Mono, monospace' }}>{targetCase.id}</strong> — <strong style={{ color: 'var(--color-text-primary)' }}>{targetCase.title}</strong>? This cannot be undone.
              </>
            ) : null}
          </div>

          {/* Warning Banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
            borderRadius: 4, padding: '8px 12px',
          }}>
            <AlertTriangle className="w-4 h-4 text-[var(--color-status-warning)] flex-shrink-0" />
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
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
                background: 'var(--color-status-flagged)',
                border: '1px solid var(--color-status-flagged)',
                color: '#FFFFFF',
                borderRadius: 4,
                padding: '8px 16px',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'opacity 120ms',
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm Deletion</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
