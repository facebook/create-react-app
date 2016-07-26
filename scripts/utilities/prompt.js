var rl = require('readline');

module.exports = function (question, cb) {
  var rlInterface = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rlInterface.question(question + '\n', function(answer) {
    rlInterface.close();
    cb(answer);
  });
};
