import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadGroup, saveGroup } from '../utils/storage';

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const [group, setGroup] = useState(null);

  const reloadGroup = (code) => {
    const loaded = loadGroup(code);
    setGroup(loaded);
  };

  const updateGroup = (newGroup) => {
    setGroup(newGroup);
    saveGroup(newGroup);
  };

  return (
    <GroupContext.Provider value={{ group, updateGroup, reloadGroup }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}
