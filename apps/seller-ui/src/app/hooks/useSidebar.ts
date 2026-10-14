'use client';
import { useAtom } from 'jotai';
import { activeSidebarItemAtom } from '../configs/constants';

const useSidebar = () => {
  const [activeSidebarItem, setActiveSidebarItem] = useAtom(
    activeSidebarItemAtom,
  );

  return {
    activeSidebarItem,
    setActiveSidebarItem,
  };
};

export default useSidebar;
