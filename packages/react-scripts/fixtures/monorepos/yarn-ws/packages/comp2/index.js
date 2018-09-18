import React from 'react';

import Comp1 from 'comp1';

const Comp2 = () => (
  <div>
    Comp2, nested Comp1: <Comp1 />
  </div>
);

export default Comp2;
