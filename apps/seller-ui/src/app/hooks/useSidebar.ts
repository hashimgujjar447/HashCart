'use client';

import { useState, useEffect } from 'react';

let globalActiveSidebarItem = '/dashboard';
const listeners = new Set<(item: string) => void>();

export const useSidebar = () => {
  const [activeSidebarItem, setActiveItem] = useState(globalActiveSidebarItem);

  useEffect(() => {
    const listener = (item: string) => {
      setActiveItem(item);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setActiveSidebarItem = (item: string) => {
    globalActiveSidebarItem = item;
    setActiveItem(item);
    listeners.forEach((l) => l(item));
  };

  return {
    activeSidebarItem,
    setActiveSidebarItem,
  };
};

export default useSidebar;
