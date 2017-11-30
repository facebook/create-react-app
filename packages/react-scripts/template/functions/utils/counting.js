const functions = require('firebase-functions');
const admin = require('firebase-admin');
try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {} // You do that because the admin SDK can only be initialized once.

module.exports = {
  handleListChange: (event, counterName) => {
    if (event.data.exists() && event.data.previous.exists()) {
      return;
    }

    const collectionRef = event.data.adminRef.parent;
    const countRef = collectionRef.parent.child(counterName);

    // Return the promise from countRef.transaction() so our function
    // waits for this async event to complete before it exits.
    return countRef
      .transaction(current => {
        if (event.data.exists()) {
          return (current || 0) + 1;
        } else {
          return (current || 0) - 1;
        }
      })
      .then(() => {
        console.log(`${counterName} counter updated.`);
      });
  },
  handleRecount: (event, listName, correction = 0) => {
    if (!event.data.exists()) {
      const counterRef = event.data.adminRef;
      const collectionRef = counterRef.parent.child(listName);

      // Return the promise from counterRef.set() so our function
      // waits for this async event to complete before it exits.
      return collectionRef
        .once('value')
        .then(messagesData =>
          counterRef.set(messagesData.numChildren() + correction)
        );
    }
  },
  handleProviderRecount: event => {
    if (!event.data.exists()) {
      const counterRef = admin.database().ref('/provider_count');
      const collectionRef = admin.database().ref('/users');

      console.log('Recounting users');

      // Return the promise from counterRef.set() so our function
      // waits for this async event to complete before it exits.
      return collectionRef.once('value').then(snapshot => {
        let promises = [];

        snapshot.forEach(userSnap => {
          const user = userSnap.val();
          const providerData = user.providerData ? user.providerData : {};

          Object.keys(providerData).forEach((key, i) => {
            const provider = providerData[i];
            const providerId = provider.providerId.replace('.com', '');

            const ref = admin
              .database()
              .ref(`/provider_count/${providerId}`)
              .transaction(current => {
                return (current || 0) + 1;
              })
              .then(() => {
                console.log(`Provider counter updated.`);
              });

            promises.push(ref);
          });
        });

        return Promise.all(promises);
      });
    }
  },
};
