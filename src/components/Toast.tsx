import React, { useEffect } from 'react';
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

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const barColor =
    toast.type === 'error'
      ? '#B53924'
      : toast.type === 'warning'
      ? '#D4854A'
      : toast.type === 'success'
      ? '#3D7A4A'
      : '#C4622D';

  return (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.25, ease: EASE_SHARP }}
      style={{
        pointerEvents: 'auto',
        background: 'var(--color-bg-raised, #FFFFFF)',
        border: '1px solid var(--color-border, #DDD5CA)',
        borderLeft: `4px solid ${barColor}`,
        borderRadius: 6,
        padding: '12px 14px 14px',
        minWidth: 280,
        maxWidth: 380,
        boxShadow: 'var(--shadow-dropdown, 0 8px 24px rgba(42, 36, 32, 0.12))',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ marginTop: 2, flexShrink: 0 }}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#B53924]" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-[#D4854A]" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#3D7A4A]" />
            ) : (
              <Info className="w-4 h-4 text-[#C4622D]" />
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary, #2A2420)', fontFamily: 'Inter, sans-serif' }}>
              {toast.title}
            </div>
            {toast.description && (
              <div style={{ fontSize: 10.5, color: 'var(--color-text-secondary, #7A6F63)', marginTop: 2, lineHeight: 1.3 }}>
                {toast.description}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {toast.onUndo && (
            <button
              type="button"
              onClick={() => {
                toast.onUndo?.();
                onDismiss(toast.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--color-bg-surface, #F3EDE4)',
                border: '1px solid #C4622D',
                borderRadius: 4,
                color: '#C4622D',
                fontSize: 10,
                fontWeight: 600,
                padding: '3px 8px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
              title="Undo this action"
            >
              <RotateCcw className="w-3 h-3 text-[#C4622D]" />
              <span>{toast.undoLabel || 'Undo'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-muted, #7A6F63)',
              cursor: 'pointer',
              padding: 2,
            }}
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5 hover:text-[#2A2420]" />
          </button>
        </div>
      </div>

      {/* Progress Bar representing the 5-sec countdown */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'rgba(0, 0, 0, 0.07)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          style={{
            height: '100%',
            background: barColor,
          }}
        />
      </div>
    </motion.div>
  );
};

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
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};
