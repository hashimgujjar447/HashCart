import React from 'react';

const SidebarHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`pb-4 ${className}`}>{children}</div>;

const SidebarBody = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`flex flex-col ${className}`}>{children}</div>;

const SidebarStyles = Object.assign(
  ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  {
    Header: SidebarHeader,
    body: SidebarBody,
  },
);

export default SidebarStyles;
