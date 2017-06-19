import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import { AppContainer } from './AppContainer';
import mockStore from 'test/mock-store';

it('renders without crashing', () => {
  const wrapper = shallow(<AppContainer />);
  expect(wrapper).toBeDefined();
});

it('calls sayHello from onSubmitHello', () => {
  const sayHello = jest.fn();
  const wrapper = shallow(<AppContainer sayHello={sayHello} />);
  wrapper.instance().onSubmitHello({ name: 'foo' });
  expect(sayHello.mock.calls.length).toEqual(1);
});
