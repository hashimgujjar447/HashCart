import SidebarBarWrapper from '@/app/shared/components/sidebar/SidebarBarWrapper';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="w-[260px] min-w-[260px] border-r border-[#1a1f2c] bg-black">
        <div className="sticky top-0 h-screen">
          <SidebarBarWrapper />
        </div>
      </aside>

      <main className="flex-1 p-6 text-white overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
