const functions = require('firebase-functions');
const counting = require('../../utils/counting');

exports = module.exports = functions.database
  .ref('/public_tasks/{taskUid}')
  .onWrite(event => {
    return Promise.all([
      counting.handleListChange(event, 'public_tasks_count'),
    ]);
  });
