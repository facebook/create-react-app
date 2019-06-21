'use strict';

module.exports = promises => {
  return new Promise(res => {
    let count = 0;
    const values = [];
    const checkAndResolve = () => {
      if (count === promises.length) {
        res(values);
      }
    };
    promises.reduce((accu, promise, i) => {
      return accu.then(() => {
        promise
          .then(value => {
            values[i] = value;
            count++;
          })
          .then(checkAndResolve);
      });
    }, Promise.resolve());
  });
};
