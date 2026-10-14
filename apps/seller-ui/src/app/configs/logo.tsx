'use client';

import React from 'react';

interface LogoProps {
  avatarUrl?: string;
}

const Logo = ({ avatarUrl }: LogoProps) => {
  if (avatarUrl) {
    return (
      <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#222735] shrink-0">
        <img
          src={avatarUrl}
          alt="Shop Logo"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl bg-[#12161f] border border-[#222735] flex items-center justify-center shrink-0">
      <svg
        className="w-5 h-5 text-gray-300"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="5" cy="5" r="1.8" />
        <circle cx="12" cy="5" r="1.8" />
        <circle cx="19" cy="5" r="1.8" />
        <circle cx="5" cy="12" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="19" cy="12" r="1.8" />
        <circle cx="5" cy="19" r="1.8" />
        <circle cx="12" cy="19" r="1.8" />
        <circle cx="19" cy="19" r="1.8" />
      </svg>
    </div>
  );
};

export default Logo;
