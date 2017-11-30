const functions = require('firebase-functions');
const counting = require('../../utils/counting');

exports = module.exports = functions.database
  .ref('/users_count')
  .onDelete(event => {
    return Promise.all([
      counting.handleRecount(event, 'users', 8),
      counting.handleProviderRecount(event),
    ]);
  });
