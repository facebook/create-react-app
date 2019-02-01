import styled from 'styled-components';

const Logo = styled.img`
  width: ${props => props.width || 80}px;
  height: ${props => props.height || 80}px;
  padding-inline-start: ${props => props.paddingInlineStart || 24}px;
  padding-inline-end: ${props => props.paddingInlineEnd || 24}px;
  margin-inline-start: ${props => props.marginLeft};
  margin-inline-end: ${props => props.marginRight};
`;

export default Logo;
