'use strict';
const sass = require('node-sass');

module.exports = {
  sassOptions: {
    functions: {
      'encodebase64($string)': str => {
        const buffer = Buffer.from(str.getValue());
  
        return sass.types.String(buffer.toString('base64'));
      }
    }
  }
};