import React from 'react';
import {connect} from 'react-redux';
import updateTimestamp from '../actions/updateTimestamp';

function ExampleTimestamp(props) {
  return (
    <div>
      <button onClick={() => props.updateTimestamp()}>Update Timestamp</button>
      <div>{props.timestamp}</div>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    timestamp: state.example.timestamp,
  };
};

const mapDispatchToProps = dispatch => ({
  updateTimestamp: () => {
    dispatch(updateTimestamp());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExampleTimestamp);
