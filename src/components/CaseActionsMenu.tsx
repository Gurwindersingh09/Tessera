import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Check, 
  Trash2, 
  UserPlus, 
  Activity, 
  ShieldAlert, 
  ChevronRight, 
  Search,
  Archive,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseItem } from '../types/schema';

const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const INVESTIGATORS_LIST = [
  { name: 'R. Okafor', role: 'Senior Cyber Investigator', initials: 'RO' },
  { name: 'S. Petrov', role: 'Telecom CDR Forensics', initials: 'SP' },
  { name: 'M. Chen', role: 'Financial Intelligence Analyst', initials: 'MC' },
  { name: 'A. Patel', role: 'Syndicate Triage Lead', initials: 'AP' },
  { name: 'V. Sharma', role: 'Special Investigation Officer', initials: 'VS' },
  { name: 'K. Lindqvist', role: 'OSINT Specialist', initials: 'KL' },
];

interface CaseActionsMenuProps {
  caseData: CaseItem;
  onStatusChange: (caseId: string, status: CaseItem['status']) => void;
  onPriorityChange: (caseId: string, priority: CaseItem['priority']) => void;
  onReassign: (caseId: string, investigator: string) => void;
  onDeleteRequest: (caseData: CaseItem) => void;
  onOpenCase?: (caseData: CaseItem) => void;
  alignRight?: boolean;
}

export const CaseActionsMenu: React.FC<CaseActionsMenuProps> = ({
  caseData,
  onStatusChange,
  onPriorityChange,
  onReassign,
  onDeleteRequest,
  onOpenCase,
  alignRight = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'none' | 'status' | 'priority' | 'reassign'>('none');
  const [investigatorQuery, setInvestigatorQuery] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu('none');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
    setActiveSubmenu('none');
  };

  const filteredInvestigators = INVESTIGATORS_LIST.filter(inv =>
    inv.name.toLowerCase().includes(investigatorQuery.toLowerCase()) ||
    inv.role.toLowerCase().includes(investigatorQuery.toLowerCase())
  );

  return (
    <div className="relative inline-block" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        title="Case actions"
        aria-label="Open case options"
        style={{
          width: 26,
          height: 26,
          borderRadius: 4,
          border: isOpen ? '1px solid #C4622D' : '1px solid transparent',
          background: isOpen ? 'var(--color-bg-hover)' : 'transparent',
          color: isOpen ? '#C4622D' : 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 120ms ease',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.background = 'var(--color-bg-hover)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }
        }}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Main Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, ease: EASE_SHARP }}
            style={{
              position: 'absolute',
              top: '100%',
              right: alignRight ? 0 : 'auto',
              left: alignRight ? 'auto' : 0,
              marginTop: 4,
              width: 210,
              background: 'var(--color-bg-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 900,
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column',
              padding: '4px 0',
            }}
          >
            {/* Header / Case ID tag */}
            <div style={{
              padding: '6px 12px 4px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span className="data-label" style={{ fontSize: '0.58rem', color: '#C4622D' }}>
                Case Action Menu
              </span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--color-text-muted)' }}>
                {caseData.id}
              </span>
            </div>

            {/* Option: Open Case workspace */}
            {onOpenCase && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenCase(caseData);
                }}
                className="case-menu-item"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '7px 12px', fontSize: 11.5,
                  border: 'none', background: 'transparent', textAlign: 'left',
                  cursor: 'pointer', color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C4622D]" />
                  <span>Open Investigation</span>
                </div>
              </button>
            )}

            {/* Option: Change Status */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setActiveSubmenu('status')}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'status' ? 'none' : 'status')}
                className="case-menu-item"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '7px 12px', fontSize: 11.5,
                  border: 'none', background: activeSubmenu === 'status' ? 'var(--color-bg-hover)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity className="w-3.5 h-3.5 text-[#C4622D]" />
                  <span>Change Status</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                    {caseData.status}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)]" />
                </div>
              </button>

              {/* Status Submenu */}
              {activeSubmenu === 'status' && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: alignRight ? '100%' : 'auto',
                    left: alignRight ? 'auto' : '100%',
                    marginRight: 4,
                    marginLeft: 4,
                    width: 140,
                    background: 'var(--color-bg-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    boxShadow: 'var(--shadow-dropdown)',
                    padding: '4px 0',
                    zIndex: 910,
                  }}
                >
                  {[
                    { key: 'active', label: 'Active', color: 'var(--color-status-active)' },
                    { key: 'flagged', label: 'Flagged', color: 'var(--color-status-flagged)' },
                    { key: 'closed', label: 'Closed', color: 'var(--color-status-closed)' },
                    { key: 'archived', label: 'Archived', color: 'var(--color-status-muted)' },
                  ].map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => {
                        onStatusChange(caseData.id, st.key as any);
                        setIsOpen(false);
                        setActiveSubmenu('none');
                      }}
                      className="case-menu-item"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '6px 12px', fontSize: 11,
                        border: 'none', background: caseData.status === st.key ? 'var(--color-bg-hover)' : 'transparent',
                        cursor: 'pointer', color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
                        <span>{st.label}</span>
                      </div>
                      {caseData.status === st.key && <Check className="w-3 h-3 text-[#C4622D]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Option: Change Priority */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setActiveSubmenu('priority')}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'priority' ? 'none' : 'priority')}
                className="case-menu-item"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '7px 12px', fontSize: 11.5,
                  border: 'none', background: activeSubmenu === 'priority' ? 'var(--color-bg-hover)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert className="w-3.5 h-3.5 text-[#C4622D]" />
                  <span>Change Priority</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                    {caseData.priority}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)]" />
                </div>
              </button>

              {/* Priority Submenu */}
              {activeSubmenu === 'priority' && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: alignRight ? '100%' : 'auto',
                    left: alignRight ? 'auto' : '100%',
                    marginRight: 4,
                    marginLeft: 4,
                    width: 140,
                    background: 'var(--color-bg-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    boxShadow: 'var(--shadow-dropdown)',
                    padding: '4px 0',
                    zIndex: 910,
                  }}
                >
                  {[
                    { key: 'critical', label: 'Critical', color: 'var(--color-status-flagged)' },
                    { key: 'high', label: 'High', color: 'var(--color-status-active)' },
                    { key: 'medium', label: 'Medium', color: 'var(--color-status-warning)' },
                    { key: 'low', label: 'Low', color: 'var(--color-border-strong)' },
                  ].map((pr) => (
                    <button
                      key={pr.key}
                      type="button"
                      onClick={() => {
                        onPriorityChange(caseData.id, pr.key as any);
                        setIsOpen(false);
                        setActiveSubmenu('none');
                      }}
                      className="case-menu-item"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '6px 12px', fontSize: 11,
                        border: 'none', background: caseData.priority === pr.key ? 'var(--color-bg-hover)' : 'transparent',
                        cursor: 'pointer', color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: pr.color }} />
                        <span>{pr.label}</span>
                      </div>
                      {caseData.priority === pr.key && <Check className="w-3 h-3 text-[#C4622D]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Option: Reassign Investigator */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setActiveSubmenu('reassign')}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu(activeSubmenu === 'reassign' ? 'none' : 'reassign')}
                className="case-menu-item"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '7px 12px', fontSize: 11.5,
                  border: 'none', background: activeSubmenu === 'reassign' ? 'var(--color-bg-hover)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserPlus className="w-3.5 h-3.5 text-[#C4622D]" />
                  <span>Reassign</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', maxWidth: 65, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {caseData.investigator || 'Unassigned'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)]" />
                </div>
              </button>

              {/* Reassign Submenu */}
              {activeSubmenu === 'reassign' && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: alignRight ? '100%' : 'auto',
                    left: alignRight ? 'auto' : '100%',
                    marginRight: 4,
                    marginLeft: 4,
                    width: 220,
                    background: 'var(--color-bg-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    boxShadow: 'var(--shadow-dropdown)',
                    padding: '6px 0',
                    zIndex: 910,
                  }}
                >
                  {/* Search Filter input */}
                  <div style={{ padding: '0 8px 6px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search className="w-3 h-3 text-[var(--color-text-muted)] absolute left-2" />
                      <input
                        type="text"
                        placeholder="Search analyst..."
                        value={investigatorQuery}
                        onChange={(e) => setInvestigatorQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          fontSize: 10.5,
                          padding: '4px 6px 4px 22px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 4,
                          background: 'var(--color-bg-surface)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                    {filteredInvestigators.map((inv) => (
                      <button
                        key={inv.name}
                        type="button"
                        onClick={() => {
                          onReassign(caseData.id, inv.name);
                          setIsOpen(false);
                          setActiveSubmenu('none');
                        }}
                        className="case-menu-item"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '6px 12px', fontSize: 11,
                          border: 'none', background: caseData.investigator === inv.name ? 'var(--color-bg-hover)' : 'transparent',
                          cursor: 'pointer', color: 'var(--color-text-primary)', textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8.5, fontWeight: 600, color: '#C4622D',
                          }}>
                            {inv.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{inv.name}</div>
                            <div style={{ fontSize: 9, color: 'var(--color-text-secondary)' }}>{inv.role}</div>
                          </div>
                        </div>
                        {caseData.investigator === inv.name && <Check className="w-3 h-3 text-[#C4622D]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div style={{ height: 1, background: 'var(--color-border)', margin: '3px 0' }} />

            {/* Option: Delete Case */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDeleteRequest(caseData);
              }}
              className="case-menu-item-destructive"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '7px 12px', fontSize: 11.5,
                border: 'none', background: 'transparent', textAlign: 'left',
                cursor: 'pointer', color: 'var(--color-status-flagged)', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-[var(--color-status-flagged)]" />
              <span>Delete Case File</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
