const functions = require('firebase-functions');
const admin = require('firebase-admin');
try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {} // You do that because the admin SDK can only be initialized once.
const notifications = require('../../utils/notifications');

exports = module.exports = functions.database
  .ref('/public_chats/{taskUid}')
  .onCreate(event => {
    const taskUid = event.params.taskUid;
    const eventSnapshot = event.data;
    const userId = eventSnapshot.child('userId').val();

    return admin
      .database()
      .ref(`/users`)
      .once('value')
      .then(snapshot => {
        let user = null;
        let registrationTokens = [];

        snapshot.forEach(function(childSnapshot) {
          const childData = childSnapshot.val();

          if (childSnapshot.key === userId) {
            user = childData;
          } else {
            childSnapshot.child('notificationTokens').forEach(token => {
              if (token.val()) {
                registrationTokens.push(token.key);
              }
            });
          }
        });

        const payload = {
          notification: {
            title: `${user
              ? user.displayName
              : 'Someone'} wrote a new message!`,
            body: eventSnapshot.child('message').val(),
            icon:
              user && user.photoURL !== undefined
                ? user.photoURL
                : '/apple-touch-icon.png',
            click_action: 'https://www.react-most-wanted.com/public_chats',
          },
        };

        if (registrationTokens.length) {
          return admin
            .messaging()
            .sendToDevice(registrationTokens, payload)
            .then(function(response) {
              // See the MessagingDevicesResponse reference documentation for
              // the contents of response.
              console.log('Successfully sent message:', response);
            })
            .catch(function(error) {
              console.log('Error sending message:', error);
            });
        } else {
          console.log('Not tokens registered:', error);
          return;
        }
      });
  });
