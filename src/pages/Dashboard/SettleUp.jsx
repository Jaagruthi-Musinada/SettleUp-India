import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGroup } from '../../context/GroupContext';
import { formatINR } from '../../utils/format';

export default function SettleUp() {
  const { group, updateGroup } = useGroup();
  const [showConfetti, setShowConfetti] = useState(false);

  const { settlements, members } = group;

  const total = settlements.length;
  const doneCount = settlements.filter(s => s.status === 'done').length;
  const progress = total === 0 ? 0 : (doneCount / total) * 100;

  useEffect(() => {
    if (total > 0 && doneCount === total && !showConfetti) {
      setShowConfetti(true);
      
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [total, doneCount, showConfetti]);

  const markAsDone = (id) => {
    const newGroup = { ...group };
    newGroup.settlements = newGroup.settlements.map(s => s.id === id ? { ...s, status: 'done' } : s);
    updateGroup(newGroup);
  };

  const getUpiLink = (upiId, name, amount) => {
    return `upi://pay?pa=${encodeURIComponent(upiId || '')}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
  };

  const shareSummary = () => {
    const text = `*${group.name} — Expense Summary*\n\nTotal spent: ${formatINR(group.expenses.reduce((sum, e) => sum + e.amount, 0))}\nMembers: ${group.members.map(m=>m.name).join(', ')}\n\nHow we settled:\n${settlements.map(s => {
      const from = members.find(m => m.id === s.fromId)?.name;
      const to = members.find(m => m.id === s.toId)?.name;
      const methodText = s.method === 'upi' ? 'via UPI' : s.method === 'cash' ? 'cash' : 'in person';
      return `- ${from} paid ${formatINR(s.amount)} ${methodText} -> ${to} [${s.status === 'done' ? 'Done' : 'Pending'}]`;
    }).join('\n')}\n\nTracked with SettleUp India\nJoin our group: ${window.location.origin}${window.location.pathname}#/${group.code}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', opacity: 0.6 }}>
        <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>No settlements needed yet!</p>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '8px' }}>Add expenses and everyone's balances will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 24px 100px 24px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Here's how to settle up</h2>

      {/* Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <span>{doneCount} of {total} settled</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--glass-bg)', borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ height: '100%', background: 'var(--primary-accent)', borderRadius: '4px' }}
          />
        </div>
      </div>

      <AnimatePresence>
        {total === doneCount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ padding: '24px', textAlign: 'center', marginBottom: '24px', background: 'rgba(52, 201, 122, 0.1)', borderColor: 'var(--badge-upi)' }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>All Settled! 🎉</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{group.name} is fully settled</p>
            <button onClick={shareSummary} className="pill-btn" style={{ background: '#25D366', color: '#fff' }}>
              Share Summary on WhatsApp
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {settlements.map((s) => {
          const fromMember = members.find(m => m.id === s.fromId);
          const toMember = members.find(m => m.id === s.toId);
          if (!fromMember || !toMember) return null;

          const isDone = s.status === 'done';
          const avatarFromIdx = members.findIndex(m => m.id === s.fromId);
          const avatarToIdx = members.findIndex(m => m.id === s.toId);

          return (
            <motion.div
              layout
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isDone ? 0.6 : 1, y: 0 }}
              className="glass-card"
              style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `var(--avatar-${avatarFromIdx % 8})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {fromMember.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.8rem' }}>{fromMember.name}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {formatINR(s.amount)}
                  </span>
                  <div style={{ color: 'var(--text-secondary)' }}>&rarr;</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `var(--avatar-${avatarToIdx % 8})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {toMember.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.8rem' }}>{toMember.name}</span>
                </div>
              </div>

              {s.method === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className="pill-badge badge-upi">via UPI</span>
                  </div>
                  {!isDone && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={getUpiLink(toMember.upiId, toMember.name, s.amount)} className="pill-btn outlined" style={{ flex: 1, padding: '10px', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'center' }}>
                        Pay Now
                      </a>
                      <button onClick={() => markAsDone(s.id)} className="pill-btn badge-upi" style={{ flex: 1, padding: '10px', fontSize: '0.9rem', color: '#000' }}>
                        Mark as Done
                      </button>
                    </div>
                  )}
                </div>
              )}

              {s.method === 'cash' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className="pill-badge badge-cash">Hand cash</span>
                  </div>
                  {!isDone && (
                    <button onClick={() => markAsDone(s.id)} className="pill-btn outlined" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: 'var(--badge-cash)', borderColor: 'var(--badge-cash)' }}>
                      Mark as Received
                    </button>
                  )}
                </div>
              )}

              {s.method === 'collect' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className="pill-badge badge-nophone">Collect in person</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {group.members.find(m => m.id === fromMember.collectorId)?.name || 'Collector'} will collect from {fromMember.name}
                  </div>
                  {!isDone && (
                    <button onClick={() => markAsDone(s.id)} className="pill-btn outlined" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', marginTop: '4px' }}>
                      Mark as Collected
                    </button>
                  )}
                </div>
              )}

              <AnimatePresence>
                {isDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--badge-upi)', fontSize: '1.2rem' }}
                  >
                    ✓
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
