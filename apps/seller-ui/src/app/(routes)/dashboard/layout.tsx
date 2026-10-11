import SidebarBarWrapper from '@/app/shared/components/sidebar/SidebarBarWrapper';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full bg-black min-h-screen">
      <aside className="w-[280px] p-4 min-w-[250px] border-r border-r-slate-800 text-white p-4s">
        <div className="sticky top-0 ">
          <SidebarBarWrapper />
        </div>
      </aside>

      <main className="flex-1 p-4 text-white">
        <div className="overflow-auto"> {children}</div>
      </main>
    </div>
  );
};

export default Layout;
