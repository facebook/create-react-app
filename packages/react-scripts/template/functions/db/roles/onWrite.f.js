const functions = require('firebase-functions');
const admin = require('firebase-admin');
try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {} // You do that because the admin SDK can only be initialized once.

exports = module.exports = functions.database
  .ref('/roles/{roleUid}')
  .onWrite(event => {
    // Exit when the data is not deleted.
    if (event.data.exists()) {
      return;
    }

    const roleUid = event.params.roleUid;

    return (grantRef = admin
      .database()
      .ref(`role_grants/${roleUid}`)
      .remove());
  });
