import { motion } from 'framer-motion';
import { useGroup } from '../../context/GroupContext';
import { formatINR, CATEGORY_EMOJIS } from '../../utils/format';
import { computeBalances } from '../../utils/settlementAlgorithm';

export default function Summary() {
  const { group } = useGroup();

  const totalSpent = group.expenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseCount = group.expenses.length;
  const memberCount = group.members.length;
  const daysActive = Math.max(1, Math.ceil((Date.now() - group.createdAt) / (1000 * 60 * 60 * 24)));

  const isFullySettled = group.settlements.length > 0 && group.settlements.every(s => s.status === 'done');

  const categoryTotals = {};
  group.expenses.forEach(e => {
    if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
    categoryTotals[e.category] += e.amount;
  });

  const categoryArray = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]) // highest first
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percent: totalSpent ? (amt / totalSpent) * 100 : 0
    }));

  const balances = computeBalances(group);
  const userStats = group.members.map((m, i) => ({
    ...m,
    paid: balances[m.id].paid,
    owed: balances[m.id].owed,
    net: balances[m.id].net,
    avatarIndex: i
  })).sort((a, b) => b.net - a.net);

  const shareSummary = () => {
    const text = `*${group.name} — Expense Summary*\n\nTotal spent: ${formatINR(totalSpent)}\nMembers: ${group.members.map(m=>m.name).join(', ')}\n\nTracked with SettleUp India\nJoin our group: ${window.location.origin}${window.location.pathname}#/${group.code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <div style={{ padding: '16px 24px 100px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Summary</h2>
        {isFullySettled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="pill-badge"
            style={{ background: 'rgba(52, 201, 122, 0.2)', color: 'var(--badge-upi)', border: '1px solid var(--badge-upi)' }}
          >
            Fully Settled ✓
          </motion.div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Spent</span>
          <span className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{formatINR(totalSpent)}</span>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Expenses</span>
          <span className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{expenseCount}</span>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Members</span>
          <span className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{memberCount}</span>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Days Active</span>
          <span className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{daysActive}</span>
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Category Breakdown</h3>
      {categoryArray.length === 0 ? (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>No expenses to categorize.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {categoryArray.map((cat, i) => (
            <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ textTransform: 'capitalize' }}>
                  <span style={{ marginRight: '8px' }}>{CATEGORY_EMOJIS[cat.category]}</span>
                  {cat.category}
                </span>
                <span style={{ fontWeight: 'bold' }}>{formatINR(cat.amount)}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--glass-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.percent}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  style={{ height: '100%', background: `var(--avatar-${i % 8})`, borderRadius: '4px' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Member Breakdown</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {userStats.map(m => (
          <div key={m.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: `var(--avatar-${m.avatarIndex % 8})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase',
              flexShrink: 0
            }}>
              {m.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{m.name}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Paid for group: <strong style={{ color: 'var(--text-primary)' }}>{formatINR(m.paid)}</strong></span>
                <span>Their total share: <strong style={{ color: 'var(--text-primary)' }}>{formatINR(m.owed)}</strong></span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ 
                fontSize: '0.75rem', 
                color: m.net > 0 ? 'var(--badge-upi)' : m.net < 0 ? 'var(--badge-red)' : 'var(--text-secondary)', 
                display: 'block', marginBottom: '2px', fontWeight: 'bold' 
              }}>
                {m.net > 0 ? 'Gets Back' : m.net < 0 ? 'Owes Group' : 'Settled'}
              </span>
              <span style={{
                fontSize: '1.2rem', fontWeight: 'bold',
                color: m.net > 0 ? 'var(--badge-upi)' : m.net < 0 ? 'var(--badge-red)' : 'var(--text-primary)'
              }}>
                {formatINR(Math.abs(m.net))}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={shareSummary} className="pill-btn outlined" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <span style={{ color: '#25D366' }}>WhatsApp</span> Share Summary
      </button>

    </div>
  );
}
