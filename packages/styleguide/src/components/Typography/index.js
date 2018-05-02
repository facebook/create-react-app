import styled, { css } from 'styled-components';
import { rem } from './../../style';

const baseCSS = css`
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.black};
  margin-top: 0;
  margin-bottom: ${props => props.theme.spaces.medium};
  max-width: ${props => props.theme.contentWidth};
`;

export const H1 = styled.h1`
  ${baseCSS};
  font-size: ${rem(54)};
  line-height: 1.3333;
  margin-bottom: ${props => props.theme.spaces.large};
`;

export const H2 = styled.h1`
  ${baseCSS};
  font-size: ${rem(36)};
  line-height: 1.3333;
`;

export const H3 = styled.h1`
  ${baseCSS};
  font-size: ${rem(24)};
  line-height: 1.3333;
`;

export const H4 = styled.h1`
  ${baseCSS};
  font-size: ${props => rem(props.theme.fontSizes.base)};
  line-height: ${props => props.theme.lineHeights.base};
`;

export const H5 = styled.h1`
  ${baseCSS};
  color: ${props => props.theme.colors.greyDark};
  font-size: ${props => rem(props.theme.fontSizes.base)};
  line-height: ${props => props.theme.lineHeights.base};
  text-transform: uppercase;
`;

export const P = styled.p`
  font-family: ${props => props.theme.fontFamily};
  color: ${props => props.theme.colors.black};
  line-height: ${props => props.theme.lineHeights.base};
  margin-top: 0;
  margin-bottom: ${props => props.theme.spaces.medium};
  max-width: ${props => props.theme.contentWidth};
`;

export const Link = styled.a`
  font-family: ${props => props.theme.fontFamily};
  color: ${props => props.theme.colors.accent};
  line-height: ${props => props.theme.lineHeights.base};

  &:focus,
  &:hover {
    text-decoration: none;
  }
`;
