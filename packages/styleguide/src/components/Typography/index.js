import styled, { css } from 'styled-components';
import { rem } from './../../style';
import * as theme from './../../style/theme';

const baseCSS = css`
  font-family: ${props => props.theme?.fontFamily ?? theme.fontFamily};
  font-weight: ${props =>
    props.theme?.fontWeights?.bold ?? theme.fontWeights.bold};
  color: ${props => props.theme?.colors?.black ?? theme.colors.black};
  margin-top: 0;
  margin-bottom: ${props => props.theme?.spaces?.medium ?? theme.spaces.medium};
  max-width: ${props => props.theme?.contentWidth ?? theme.contentWidth};
`;

export const H1 = styled.h1`
  ${baseCSS};
  font-size: ${rem(54)};
  line-height: 1.3333;
  margin-bottom: ${props => props.theme?.spaces?.large ?? theme.spaces.large};
`;
H1.displayName = 'H1';

export const H2 = styled.h2`
  ${baseCSS};
  font-size: ${rem(36)};
  line-height: 1.3333;
`;
H2.displayName = 'H2';

export const H3 = styled.h3`
  ${baseCSS};
  font-size: ${rem(24)};
  line-height: 1.3333;
`;
H3.displayName = 'H3';

export const H4 = styled.h4`
  ${baseCSS};
  font-size: ${props =>
    rem(props.theme?.fontSizes?.base ?? theme.fontSizes.base)};
  line-height: ${props =>
    props.theme?.lineHeights?.base ?? theme.lineHeights.base};
`;
H4.displayName = 'H4';

export const H5 = styled.h5`
  ${baseCSS};
  color: ${props => props.theme?.colors?.greyDark ?? theme.colors.grayDark};
  font-size: ${props =>
    rem(props.theme?.fontSizes?.base ?? theme.fontSizes.base)};
  line-height: ${props =>
    props.theme?.lineHeights?.base ?? theme.lineHeights.base};
  text-transform: uppercase;
`;
H5.displayName = 'H5';

export const P = styled.p`
  font-family: ${props => props.theme?.fontFamily ?? theme.fontFamily};
  color: ${props => props.theme?.colors?.black ?? theme.colors.black};
  line-height: ${props =>
    props.theme?.lineHeights?.base ?? theme.lineHeights.base};
  margin-top: 0;
  margin-bottom: ${props => props.theme?.spaces?.medium ?? theme.spaces.medium};
  max-width: ${props => props.theme?.contentWidth ?? theme.contentWidth};
`;
P.displayName = 'P';

export const Link = styled.a`
  font-family: ${props => props.theme?.fontFamily ?? theme.fontFamily};
  color: ${props => props.theme?.colors?.accent ?? theme.colors.accent};
  line-height: ${props =>
    props.theme?.lineHeights?.base ?? theme.lineHeights.base};

  &:focus,
  &:hover {
    text-decoration: none;
  }
`;
Link.displayName = 'Link';
