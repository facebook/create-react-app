const functions = require('firebase-functions');
const admin = require('firebase-admin');
try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {} // You do that because the admin SDK can only be initialized once.
const counting = require('../../utils/counting');

exports = module.exports = functions.database
  .ref('/users/{userUid}')
  .onCreate(event => {
    const user = event.data; // The Firebase user.
    const provider = user.providerData ? user.providerData[0] : {};
    const providerId = provider.providerId
      ? provider.providerId.replace('.com', '')
      : provider.providerId;

    let providerCount = null;

    if (providerId) {
      providerCount = admin
        .database()
        .ref(`/provider_count/${providerId}`)
        .transaction(current => (current || 0) + 1);
    }

    return Promise.all([
      counting.handleListChange(event, 'users_count'),
      providerCount,
    ]);
  });
