// @flow
import React from 'react';
import PropTypes from 'prop-types';
import './Hello.scss';

export default class Hello extends React.PureComponent {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  };

  state = {
    name: '',
  }

  onChangeName = (event: Object) => {
    this.setState({ name: event.target.value });
  }

  onSubmitForm = (event: Object) => {
    event.preventDefault();
    this.props.onSubmit({ name: this.state.name });
    this.setState({ name: '' });
  }

  render() {
    return (
      <div className="Hello">
        <form onSubmit={this.onSubmitForm}>
          <input
            placeholder="Hello"
            onChange={this.onChangeName}
            value={this.state.name}
            />
          <button>Submit</button>
        </form>
      </div>
    );
  }
}
