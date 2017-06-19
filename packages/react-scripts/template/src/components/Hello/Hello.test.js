import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import Hello from './Hello';

it('renders without crashing', () => {
  const wrapper = shallow(<Hello onSubmit={jest.fn()} />);
  expect(wrapper).toBeDefined();
});

it('sets name state on input change', () => {
  const wrapper = shallow(<Hello onSubmit={jest.fn()} />);
  wrapper.find('input').simulate('change', { target: { value: 'foo' } })
  expect(wrapper.state('name')).toEqual('foo');
});

it('sets input name on state change', () => {
  const wrapper = shallow(<Hello onSubmit={jest.fn()} />);
  wrapper.setState({ name: 'foo' });
  expect(wrapper.find('input').node.props.value).toEqual('foo');
});

it('calls onSubmit when form is submitted', () => {
  const onSubmitHelloMock = jest.fn();
  const wrapper = shallow(<Hello onSubmit={onSubmitHelloMock} />);
  wrapper.find('form').simulate('submit', { preventDefault: () => {} });
  expect(onSubmitHelloMock.mock.calls.length).toEqual(1);
});

it('resets name when form is submitted', () => {
  const wrapper = shallow(<Hello onSubmit={jest.fn()} />);
  wrapper.setState({ name: 'foo' });
  wrapper.find('form').simulate('submit', { preventDefault: () => {} });
  expect(wrapper.state('name')).toEqual('');
});
