import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGroup } from '../context/GroupContext';
import { generateId } from '../utils/storage';
import { CATEGORY_EMOJIS, classNames } from '../utils/format';
import { generateSettlements } from '../utils/settlementAlgorithm';

export default function AddExpenseSheet({ isOpen, onClose }) {
  const { group, updateGroup } = useGroup();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(group?.members[0]?.id || '');
  const [category, setCategory] = useState('other');
  // splitType = 'equal', 'custom', 'percent'
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState({});

  if (!isOpen) return null;

  const handleAmountChange = (e) => {
    // only numbers
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleCustomSplitChange = (memberId, val) => {
    setCustomSplits(prev => ({
      ...prev,
      [memberId]: val.replace(/\D/g, '')
    }));
  };

  const isFormValid = () => {
    if (!title.trim() || !amount || Number(amount) <= 0 || !paidBy) return false;
    
    if (splitType === 'custom') {
      const totalCustom = Object.values(customSplits).reduce((sum, v) => sum + Number(v || 0), 0);
      if (totalCustom !== Number(amount)) return false;
    }
    
    if (splitType === 'percent') {
      const totalPercent = Object.values(customSplits).reduce((sum, v) => sum + Number(v || 0), 0);
      if (totalPercent !== 100) return false;
    }

    return true;
  };

  const handleAdd = () => {
    if (!isFormValid()) return;

    const numAmount = Number(amount);
    let splits = {};

    if (splitType === 'equal') {
      const splitAmount = numAmount / group.members.length;
      group.members.forEach(m => splits[m.id] = splitAmount);
    } else if (splitType === 'custom') {
      group.members.forEach(m => splits[m.id] = Number(customSplits[m.id] || 0));
    } else if (splitType === 'percent') {
      group.members.forEach(m => {
        const p = Number(customSplits[m.id] || 0);
        splits[m.id] = (p / 100) * numAmount;
      });
    }

    const newExpense = {
      id: generateId(),
      title: title.trim(),
      amount: numAmount,
      paidBy,
      category,
      splitType,
      splits,
      createdAt: Date.now()
    };

    const newGroup = { ...group };
    newGroup.expenses = [newExpense, ...newGroup.expenses];
    
    // Recalculate settlements fully
    newGroup.settlements = generateSettlements(newGroup);

    updateGroup(newGroup);

    // Call success toast here via custom event or context, or just close for now
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: `✓ ${newExpense.title} added — ₹${numAmount.toLocaleString('en-IN')}` 
    }));
    
    // Reset and close
    setTitle('');
    setAmount('');
    setCustomSplits({});
    setSplitType('equal');
    onClose();
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}>
        {/* Dark overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)'
          }}
        />

        {/* Sheet content */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="glass-card"
          style={{
            background: 'var(--surface-color)',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            position: 'relative',
            zIndex: 101,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: '24px', overflowY: 'auto' }} className="hide-scrollbar">
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', margin: '0 auto 24px' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <input
                  type="text"
                  placeholder="Expense title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', fontSize: '1.4rem', fontWeight: '500', background: 'transparent', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-secondary)' }}>₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  style={{ width: '100%', fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', background: 'transparent' }}
                />
              </div>

              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Paid by</p>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scrollbar">
                  {group.members.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setPaidBy(m.id)}
                      style={{
                        padding: '6px 16px 6px 6px',
                        borderRadius: '24px',
                        background: paidBy === m.id ? 'var(--glass-bg)' : 'transparent',
                        border: `1px solid ${paidBy === m.id ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: `var(--avatar-${i % 8})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 'bold'
                      }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.9rem', color: paidBy === m.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {m.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Category</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {Object.entries(CATEGORY_EMOJIS).map(([key, emoji]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: category === key ? 'var(--glass-bg)' : 'transparent',
                        border: `1px solid ${category === key ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                      <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: category === key ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{key}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
                  {['equal', 'custom', 'percent'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSplitType(type)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: splitType === type ? 'var(--glass-bg)' : 'transparent',
                        textTransform: 'capitalize',
                        color: splitType === type ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {type === 'percent' ? 'By %' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Split Inputs */}
              {(splitType === 'custom' || splitType === 'percent') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {group.members.map((m, i) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: `var(--avatar-${i % 8})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', fontWeight: 'bold'
                        }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{m.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100px' }}>
                        {splitType === 'custom' && <span style={{ color: 'var(--text-secondary)' }}>₹</span>}
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          value={customSplits[m.id] || ''}
                          onChange={e => handleCustomSplitChange(m.id, e.target.value)}
                          style={{ width: '100%', textAlign: 'right', fontSize: '1.1rem' }}
                        />
                        {splitType === 'percent' && <span style={{ color: 'var(--text-secondary)' }}>%</span>}
                      </div>
                    </div>
                  ))}
                  {splitType === 'custom' && (
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: Number(amount) === Object.values(customSplits).reduce((sum, v) => sum + Number(v || 0), 0) ? 'var(--badge-upi)' : 'var(--badge-red)' }}>
                      Total: ₹{Object.values(customSplits).reduce((sum, v) => sum + Number(v || 0), 0)} / ₹{amount || 0}
                    </div>
                  )}
                  {splitType === 'percent' && (
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 100 === Object.values(customSplits).reduce((sum, v) => sum + Number(v || 0), 0) ? 'var(--badge-upi)' : 'var(--badge-red)' }}>
                      Total: {Object.values(customSplits).reduce((sum, v) => sum + Number(v || 0), 0)}% / 100%
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleAdd}
                className="pill-btn"
                style={{ marginTop: '16px', opacity: isFormValid() ? 1 : 0.5, pointerEvents: isFormValid() ? 'auto' : 'none' }}
              >
                Add Expense
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
