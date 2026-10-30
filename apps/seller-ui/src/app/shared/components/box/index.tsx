'use client';

import React from 'react';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  css?: React.CSSProperties;
  children?: React.ReactNode;
}

const Box: React.FC<BoxProps> = ({
  css,
  style,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      style={{ boxSizing: 'border-box', ...css, ...style }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default Box;
