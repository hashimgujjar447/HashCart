'use client';

import Link from 'next/link';
import React from 'react';

interface Props {
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  href: string;
}

const SidebarItem = ({ icon, title, isActive, href }: Props) => {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 select-none ${
        isActive
          ? 'bg-[#103264] text-white font-medium hover:bg-[#133a75]'
          : 'text-[#9aa2b1] hover:text-white hover:bg-[#1b2029]'
      }`}
    >
      <span
        className={`flex items-center justify-center shrink-0 transition-colors duration-150 ${
          isActive ? 'text-[#3b82f6]' : 'text-[#9aa2b1] group-hover:text-white'
        }`}
      >
        {icon}
      </span>
      <span className="text-[14px] leading-tight font-medium tracking-tight">
        {title}
      </span>
    </Link>
  );
};

export default SidebarItem;
