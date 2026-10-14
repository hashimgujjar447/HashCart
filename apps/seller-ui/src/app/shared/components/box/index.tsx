'use client';

import styled from 'styled-components';

interface BoxProps {
  css?: React.CSSProperties;
}

const Box = styled.div.attrs<BoxProps>(({ css }) => ({
  style: css,
}))<BoxProps>`
  box-sizing: border-box;
`;

export default Box;
