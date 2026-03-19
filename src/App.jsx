import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GroupProvider } from './context/GroupContext';

// Pages
import Home from './pages/Home';
import GroupSetup from './pages/GroupSetup';
import DashboardLayout from './pages/DashboardLayout';
import ExpenseFeed from './pages/Dashboard/ExpenseFeed';
import SettleUp from './pages/Dashboard/SettleUp';
import Summary from './pages/Dashboard/Summary';

function AnimatedRoutes() {
  const location = useLocation();
  const rootPath = location.pathname.split('/')[1] || '/';

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={rootPath}>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<GroupSetup />} />
        <Route path="/:groupId" element={<DashboardLayout />}>
          <Route index element={<ExpenseFeed />} />
          <Route path="settle" element={<SettleUp />} />
          <Route path="summary" element={<Summary />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <GroupProvider>
      <HashRouter>
        <AnimatedRoutes />
      </HashRouter>
    </GroupProvider>
  );
}

export default App;
