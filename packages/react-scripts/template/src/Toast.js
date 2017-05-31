import React from 'react';
import './Toast.css';

export default class Toast extends React.Component {
  state = {
    active: true,
  };
  componentDidMount() {
    setTimeout(
      () => {
        this.setState({
          active: false,
        });
      },
      this.props.timeout
    );
  }
  render() {
    return (
      <div className={`Toast ${this.state.active ? 'active' : 'inactive'}`}>
        {this.props.children}
      </div>
    );
  }
}

Toast.defaultProps = {
  timeout: 3000,
};
