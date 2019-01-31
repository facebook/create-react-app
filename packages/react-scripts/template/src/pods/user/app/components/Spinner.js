import styled from 'styled-components';

const Spinner = styled.div`
  font-size: 10px;
  margin: 6px auto;
  text-indent: -9999em;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  background: #4dace9;
  background: -moz-linear-gradient(
    left,
    #4dace9 10%,
    rgba(255, 255, 255, 0) 42%
  );
  background: -webkit-linear-gradient(
    left,
    #4dace9 10%,
    rgba(255, 255, 255, 0) 42%
  );
  background: -o-linear-gradient(left, #4dace9 10%, rgba(255, 255, 255, 0) 42%);
  background: -ms-linear-gradient(
    left,
    #4dace9 10%,
    rgba(255, 255, 255, 0) 42%
  );
  background: linear-gradient(
    to right,
    #4dace9 10%,
    rgba(255, 255, 255, 0) 42%
  );
  position: relative;
  -webkit-animation: spin 1.4s infinite linear;
  animation: spin 1.4s infinite linear;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  &:before {
    width: 50%;
    height: 50%;
    background: #4dace9;
    border-radius: 100% 0 0 0;
    position: absolute;
    top: 0;
    left: 0;
    content: '';
  }
  &:after {
    background: #f5fffa;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    content: '';
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
`;
export default Spinner;
