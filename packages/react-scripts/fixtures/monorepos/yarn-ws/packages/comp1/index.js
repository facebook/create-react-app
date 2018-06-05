import React from 'react';

class Comp1 extends React.Component {
  static parts = {
    greeting: 'hello',
    region: 'world',
  };

  render() {
    const { greeting, region } = Comp1.parts;

    return (
      <div {...this.props}>
        Comp1
        {greeting} {region}
      </div>
    );
  }
}

export default Comp1;
