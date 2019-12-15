import styled from "styled-components";
import { Link } from "react-router-dom";
import theme from "../../theme";

export default styled(Link)`
  color: ${theme.gs1};
  background: ${theme.gs8};
  border: none;
  border-radius: 0.3rem 1rem;
  padding: 0.5rem 1rem;
  &:hover {
    color: ${theme.gs8};
    background: ${theme.gs1};
  }
`;
