'use client';

import React from 'react';

type Props = {
  title: string;
  children: React.ReactNode;
};

const SidebarMenu = ({ title, children }: Props) => {
  return (
    <div className="mt-5">
      <h3 className="text-[12px] font-medium text-[#7d8597] px-3.5 mb-1.5 select-none tracking-wide">
        {title}
      </h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
};

export default SidebarMenu;
