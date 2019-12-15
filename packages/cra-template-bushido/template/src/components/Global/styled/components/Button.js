import styled from "styled-components";
import theme from "../../theme";

export default styled.button`
  color: ${theme.gs1};
  background: ${theme.gs8};
  border: ${props => (props.border ? props.border : "none")};
  border-radius: ${props => (props.radius ? props.radius : "0.3rem 1rem")};
  padding: ${props => (props.padding ? props.padding : "0.5rem 1rem")};
  width: ${props => (props.width ? props.width : "auto")};
  height: ${props => (props.height ? props.height : "auto")};
  &:hover {
    color: ${theme.gs8};
    background: ${theme.gs1};
  }
`;
