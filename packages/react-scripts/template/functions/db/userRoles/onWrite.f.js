const functions = require('firebase-functions');
const admin = require('firebase-admin');
try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {} // You do that because the admin SDK can only be initialized once.

exports = module.exports = functions.database
  .ref('/user_roles/{userUid}/{roleUid}')
  .onWrite(event => {
    const userUid = event.params.userUid;
    const roleUid = event.params.roleUid;
    const eventSnapshot = event.data;

    const roleRef = admin.database().ref(`roles/${roleUid}`);
    const roleGrantsRef = admin.database().ref(`role_grants/${roleUid}`);
    const userGrantsRef = admin.database().ref(`user_grants/${userUid}`);

    return roleGrantsRef.once('value').then(snapshot => {
      let promises = [];

      snapshot.forEach(grant => {
        let grantRef = false;

        console.log('User role changed:', eventSnapshot.val());

        if (eventSnapshot.val()) {
          grantRef = admin
            .database()
            .ref(`user_grants/${userUid}/${grant.key}`)
            .set(true)
            .then(() => {
              console.log('Grant added:', grant.key);
            });
        } else {
          grantRef = admin
            .database()
            .ref(`user_grants/${userUid}/${grant.key}`)
            .remove()
            .then(() => {
              console.log('Grant removed:', grant.key);
            });
        }

        promises.push(grantRef);
      });

      return Promise.all(promises);
    });
  });
