// @flow
import * as React from 'react';
import styled from 'styled-components';

type Props = {
  children: React.Node,
};

const Layout = ({ children }: Props) => <StyledLayout>{children}</StyledLayout>;

const StyledLayout = styled.div``;

export default Layout;
