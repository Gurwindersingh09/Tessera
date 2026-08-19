import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

export interface ToastMessage {
  id: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description?: string;
  onUndo?: () => void;
  undoLabel?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: EASE_SHARP }}
            style={{
              pointerEvents: 'auto',
              background: '#FFFFFF',
              border: '1px solid #DDD5CA',
              borderLeft: `4px solid ${
                t.type === 'error'
                  ? '#B53924'
                  : t.type === 'warning'
                  ? '#D4854A'
                  : t.type === 'success'
                  ? '#3D7A4A'
                  : '#C4622D'
              }`,
              borderRadius: 6,
              padding: '10px 14px',
              minWidth: 280,
              maxWidth: 380,
              boxShadow: '0 4px 16px rgba(42, 36, 32, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                {t.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-[#B53924]" />
                ) : t.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-[#D4854A]" />
                ) : t.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#3D7A4A]" />
                ) : (
                  <Info className="w-4 h-4 text-[#C4622D]" />
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2A2420', fontFamily: 'Inter, sans-serif' }}>
                  {t.title}
                </div>
                {t.description && (
                  <div style={{ fontSize: 10.5, color: '#7A6F63', marginTop: 2, lineHeight: 1.3 }}>
                    {t.description}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {t.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    t.onUndo?.();
                    onDismiss(t.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: '#FAF6F0',
                    border: '1px solid #C4622D',
                    borderRadius: 4,
                    color: '#8C3D1A',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  title="Undo this action"
                >
                  <RotateCcw className="w-3 h-3 text-[#C4622D]" />
                  <span>{t.undoLabel || 'Undo'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#A89F93',
                  cursor: 'pointer',
                  padding: 2,
                }}
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5 hover:text-[#2A2420]" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
