import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateId, generateGroupCode } from '../utils/storage';
import { useGroup } from '../context/GroupContext';
import { classNames } from '../utils/format';
import confetti from 'canvas-confetti';

export default function GroupSetup() {
  const navigate = useNavigate();
  const { updateGroup } = useGroup();

  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([
    { id: generateId(), name: '', mode: 'upi', upiId: '', collectorId: null }
  ]);

  const addMember = () => {
    setMembers([...members, { id: generateId(), name: '', mode: 'upi', upiId: '', collectorId: null }]);
  };

  const removeMember = (id) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const updateMember = (id, field, value) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const isFormValid = () => {
    if (!groupName.trim()) return false;
    for (const m of members) {
      if (!m.name.trim()) return false;
      if (m.mode === 'upi' && !m.upiId.trim()) return false;
      if (m.mode === 'nophone' && !m.collectorId) return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const code = generateGroupCode();
    const newGroup = {
      code,
      name: groupName.trim(),
      createdAt: Date.now(),
      members: members.map(m => ({
        ...m,
        name: m.name.trim(),
        upiId: m.mode === 'upi' ? m.upiId.trim() : null,
        collectorId: m.mode === 'nophone' ? m.collectorId : null
      })),
      expenses: [],
      settlements: []
    };

    updateGroup(newGroup);

    // Trigger the confetti validation!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#6152F9', '#10B981', '#F59E0B', '#D946EF']
    });

    // Short delay so the user appreciates the success validation
    setTimeout(() => {
      navigate(`/${code}`);
    }, 1500);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100vh' }}
    >
      <div style={{ position: 'relative' }}>
        <label htmlFor="groupName" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Create a New Group</label>
        <input
          id="groupName"
          type="text"
          placeholder="e.g. Goa Trip 2026, Family Reunion..."
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          style={{
            fontSize: '2rem',
            fontFamily: 'var(--font-heading)',
            width: '100%',
            fontWeight: '600',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: '8px',
            background: 'transparent'
          }}
        />
      </div>

      {/* Live Preview Avatars */}
      {members.some(m => m.name.trim() !== '') && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0' }} className="hide-scrollbar">
          <AnimatePresence>
            {members.filter(m => m.name.trim()).map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{
                  minWidth: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: `var(--avatar-${index % 8})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  textTransform: 'uppercase'
                }}
              >
                {m.name.charAt(0)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Add Members</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence>
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="glass-card"
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '100%' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul, Sneha"
                      value={member.name}
                      onChange={e => updateMember(member.id, 'name', e.target.value)}
                      style={{ fontSize: '1.2rem', width: '100%', fontWeight: '500' }}
                    />
                  </div>
                  {members.length > 1 && (
                    <button onClick={() => removeMember(member.id)} style={{ color: 'var(--badge-red)', padding: '4px' }}>
                      ✕
                    </button>
                  )}
                </div>

                {/* Payment Mode Toggles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payment Preference</label>
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
                    {['upi', 'cash', 'nophone'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => updateMember(member.id, 'mode', mode)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: member.mode === mode ? 'var(--glass-bg)' : 'transparent',
                          color: member.mode === mode
                            ? (mode === 'upi' ? 'var(--badge-upi)' : mode === 'cash' ? 'var(--badge-cash)' : 'var(--badge-nophone)')
                            : 'var(--text-secondary)'
                        }}
                      >
                        {mode === 'upi' ? 'UPI' : mode === 'cash' ? 'Cash Only' : 'No Phone'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Inputs */}
                <AnimatePresence>
                  {member.mode === 'upi' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>UPI Address</label>
                        <input
                          type="text"
                          placeholder="e.g. rahul@upi, 9876543210@paytm"
                          value={member.upiId}
                          onChange={e => updateMember(member.id, 'upiId', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                  {member.mode === 'nophone' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Who handles payments for {member.name || 'this member'}?</label>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={member.collectorId || ''}
                            onChange={e => updateMember(member.id, 'collectorId', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px 32px 12px 12px',
                              background: 'rgba(255,255,255,0.08)',
                              borderRadius: '10px',
                              border: '2px solid var(--primary-accent)',
                              fontSize: '0.95rem',
                              color: member.collectorId ? 'white' : 'rgba(255,255,255,0.4)',
                              appearance: 'none',
                              cursor: 'pointer',
                              fontWeight: '600',
                              boxShadow: '0 0 10px rgba(97, 82, 249, 0.2)'
                            }}
                          >
                            <option value="" disabled>Select a member...</option>
                            {members.filter(m => m.id !== member.id && m.name.trim()).map(m => (
                              <option key={m.id} value={m.id} style={{ background: '#111', color: 'white' }}>{m.name}</option>
                            ))}
                          </select>
                          <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary-accent)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          * This person will pay and collect money on behalf of {member.name || 'them'}.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          <button onClick={addMember} className="pill-btn outlined" style={{ padding: '12px', marginTop: '8px' }}>
            + Add another member
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={handleSubmit}
        className="pill-btn shimmer-bg"
        style={{ opacity: isFormValid() ? 1 : 0.5, pointerEvents: isFormValid() ? 'auto' : 'none', background: 'linear-gradient(90deg, #6152F9, #D946EF)', color: 'white' }}
      >
        Let's Go &rarr;
      </button>
    </motion.div>
  );
}
