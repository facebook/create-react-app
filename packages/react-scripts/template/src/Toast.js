import React from 'react';
import './Toast.css';

export default class Toast extends React.Component {
  state = {
    active: true,
  };

  close = () => {
    clearTimeout(this.timeout);
    this.setState({
      active: false,
    });
  };
  componentDidMount() {
    this.timeout = setTimeout(
      () => {
        this.setState({
          active: false,
        });
      },
      this.props.timeout
    );
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  render() {
    return (
      <div className={`Toast ${this.state.active ? 'active' : 'inactive'}`}>
        <span className="Toast-text">
          {this.props.children}
        </span>
        <button className="Toast-button" onClick={this.close}>Dismiss</button>
      </div>
    );
  }
}

Toast.defaultProps = {
  timeout: 3000,
};
