import { useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useGroup } from '../context/GroupContext';
import { formatINR } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { groupId } = useParams();
  const { group, reloadGroup } = useGroup();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    reloadGroup(groupId);
  }, [groupId]);

  useEffect(() => {
    if (group === null) {
      // Small timeout to prevent immediate redirect on initial render if loading
      const timer = setTimeout(() => {
        if (!group) navigate('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [group, navigate]);

  if (!group) return null;

  const totalSpend = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const tabs = [
    { label: 'Expenses', path: `/${groupId}` },
    { label: 'Settle Up', path: `/${groupId}/settle` },
    { label: 'Summary', path: `/${groupId}/summary` }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Background Ambient Glowing Orbs */}
      <div className="bg-orbs" style={{ zIndex: 0, opacity: 0.5 }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      {/* Top Bar */}
      <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'transparent', zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{group.name}</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Code: <strong style={{color: 'var(--text-primary)'}}>{group.code}</strong></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Spend</p>
          <motion.div
            key={totalSpend}
            initial={{ scale: 1.1, color: 'var(--primary-accent)' }}
            animate={{ scale: 1, color: 'var(--text-primary)' }}
            className="font-heading"
            style={{ fontSize: '1.4rem', fontWeight: '600' }}
          >
            {formatINR(totalSpend)}
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', overflowX: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ minHeight: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav Bar */}
      <div style={{ 
        display: 'flex', 
        background: 'var(--surface-color)', 
        borderTop: '1px solid var(--border-color)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                flex: 1,
                padding: '16px 8px',
                textAlign: 'center',
                color: isActive ? 'var(--primary-accent)' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '400',
                position: 'relative'
              }}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    background: 'var(--primary-accent)'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
