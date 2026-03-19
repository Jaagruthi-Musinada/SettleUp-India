import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim().length > 0) {
      navigate(`/${joinCode.trim().toUpperCase()}`);
    }
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
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 1, marginTop: '10vh' }}>
        <h1 style={{ 
          fontSize: '3.6rem', 
          textAlign: 'center', 
          marginBottom: '16px', 
          lineHeight: '1.2',
          background: 'linear-gradient(90deg, #6152F9, #D946EF, #F59E0B)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'shimmer 4s infinite linear'
        }}>
          Split smarter.<br/>Settle faster.
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '40px', maxWidth: '400px', lineHeight: '1.5' }}>
          The simplest way to split group expenses with built-in support for UPI, Cash, and members without phones.
        </p>

        <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button className="pill-btn shimmer-bg" onClick={() => navigate('/create')}>
            Create a Group
          </button>
          
          <AnimatePresence mode="wait">
            {!showJoin ? (
              <motion.button
                key="join-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '8px' }}
                onClick={() => setShowJoin(true)}
              >
                Have a group code? Join &rarr;
              </motion.button>
            ) : (
              <motion.form
                key="join-input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleJoin}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}
              >
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    textTransform: 'uppercase'
                  }}
                  autoFocus
                />
                <button type="submit" className="pill-btn outlined" style={{ padding: '12px' }}>
                  Join Group
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Feature Pills Footer */}
      <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', position: 'relative', zIndex: 1, paddingBottom: '40px' }}>
        <span className="pill-badge" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>UPI + Cash + No Phone</span>
        <span className="pill-badge" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>No signup needed</span>
        <span className="pill-badge" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Settle in minutes</span>
      </div>
    </motion.div>
  );
}
