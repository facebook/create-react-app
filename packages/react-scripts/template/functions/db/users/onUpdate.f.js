const functions = require('firebase-functions');
const admin = require('firebase-admin');
try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {} // You do that because the admin SDK can only be initialized once.
const userSync = require('./userSync');

exports = module.exports = functions.database
  .ref('/users/{userUid}')
  .onUpdate(event => {
    return Promise.all([
      userSync.syncPublicTasks(event, admin),
      userSync.syncPublicChats(event, admin),
    ]);
  });
