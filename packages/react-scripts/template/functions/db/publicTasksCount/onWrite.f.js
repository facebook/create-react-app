const functions = require('firebase-functions');
const counting = require('../../utils/counting');

exports = module.exports = functions.database
  .ref('/public_tasks_count')
  .onWrite(event => counting.handleRecount(event, 'public_tasks'));
