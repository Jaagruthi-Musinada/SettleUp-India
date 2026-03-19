import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGroup } from '../../context/GroupContext';
import { formatINR, CATEGORY_EMOJIS } from '../../utils/format';
import { computeBalances } from '../../utils/settlementAlgorithm';
import AddExpenseSheet from '../../components/AddExpenseSheet';

export default function ExpenseFeed() {
  const { group } = useGroup();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const handleToast = (e) => {
      setToastMsg(e.detail);
      setTimeout(() => setToastMsg(null), 3000);
    };
    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);

  const balances = computeBalances(group);
  const memberBalances = group.members.map((m, i) => ({
    ...m,
    net: balances[m.id].net,
    avatarIndex: i
  }));

  const EmptyState = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', opacity: 0.6 }}>
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <line x1="8" y1="14" x2="16" y2="14"></line>
        <line x1="12" y1="18" x2="16" y2="18"></line>
      </svg>
      <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>No expenses yet.<br/>Add your first one!</p>
    </div>
  );

  return (
    <div style={{ padding: '0 0 80px 0', minHeight: '100%' }}>
      {/* Scrollable Member Balance Row */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-color)' }} className="hide-scrollbar">
        {memberBalances.map(m => (
          <div key={m.id} className="glass-card" style={{ padding: '12px', minWidth: '120px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: `var(--avatar-${m.avatarIndex % 8})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase'
            }}>
              {m.name.charAt(0)}
            </div>
            <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '100%' }}>{m.name}</span>
            <span style={{ 
              fontSize: '1rem', fontWeight: 'bold', 
              color: m.net > 0 ? 'var(--badge-upi)' : m.net < 0 ? 'var(--badge-red)' : 'var(--text-secondary)' 
            }}>
              {m.net > 0 ? '+' : ''}{formatINR(m.net)}
            </span>
          </div>
        ))}
      </div>

      {/* Expense Feed Area */}
      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {group.expenses.length === 0 ? (
          <EmptyState />
        ) : (
          group.expenses.map((exp, index) => {
            const payer = group.members.find(m => m.id === exp.paidBy);
            const includedMemberIds = Object.keys(exp.splits).filter(id => exp.splits[id] > 0);
            
            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card"
                style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}
              >
                <div style={{ fontSize: '2.5rem', flexShrink: 0, width: '48px', textAlign: 'center' }}>
                  {CATEGORY_EMOJIS[exp.category]}
                </div>
                
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{exp.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Paid by <strong style={{color: 'var(--text-primary)'}}>{payer ? payer.name : 'Unknown'}</strong>
                    </p>
                    {exp.createdAt && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--glass-bg)', padding: '4px 8px', borderRadius: '12px', border: '1px solid var(--border-color)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(exp.createdAt))}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'capitalize' }}>
                      {exp.splitType === 'percent' ? '%' : exp.splitType}
                    </span>
                    <div style={{ display: 'flex', marginLeft: '4px' }}>
                      {includedMemberIds.slice(0, 4).map((id, i) => {
                        const avatarIdx = group.members.findIndex(m => m.id === id);
                        return (
                          <div key={id} style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: `var(--avatar-${avatarIdx % 8})`,
                            marginLeft: i > 0 ? '-8px' : '0',
                            border: '1px solid var(--surface-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: 'bold'
                          }}>
                            {group.members.find(m=>m.id===id)?.name.charAt(0).toUpperCase()}
                          </div>
                        );
                      })}
                      {includedMemberIds.length > 4 && (
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: 'var(--glass-bg)', marginLeft: '-8px', border: '1px solid var(--surface-color)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem'
                        }}>+{includedMemberIds.length - 4}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="font-heading" style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                    {formatINR(exp.amount)}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => setIsSheetOpen(true)}
        style={{
          position: 'fixed',
          bottom: '80px', // Above bottom nav
          right: '24px',
          width: '64px', height: '64px',
          borderRadius: '50%',
          background: 'var(--primary-accent)',
          color: 'var(--text-primary)',
          fontSize: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px var(--primary-dim)',
          zIndex: 50
        }}
      >
        +
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '24px', right: '24px',
              background: 'var(--badge-upi)',
              color: '#000',
              padding: '12px 16px',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: '600',
              zIndex: 60,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AddExpenseSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </div>
  );
}
