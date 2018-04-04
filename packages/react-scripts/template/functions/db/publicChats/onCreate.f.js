const functions = require('firebase-functions')
const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { } // You do that because the admin SDK can only be initialized once.

exports = module.exports = functions.database.ref('/public_chats/{taskUid}').onCreate((eventSnapshot, context) => {
  const authorName = eventSnapshot.child('authorName').val()
  const authorPhotoUrl = eventSnapshot.child('authorPhotoUrl').val()

  return admin.database().ref(`/notification_tokens`).once('value').then(nTokens => {
    let registrationTokens = []

    nTokens.forEach(user => {
      user.forEach(token => {
        registrationTokens.push(token.key)
      })
    })

    const payload = {
      notification: {
        title: `${authorName || 'UserName'}`,
        body: eventSnapshot.child('message').val(),
        icon: authorPhotoUrl || '/apple-touch-icon.png',
        click_action: 'https://www.react-most-wanted.com/public_chats',
        tag: 'public_chat'
      }
    }

    if (registrationTokens.length) {
      return admin.messaging().sendToDevice(registrationTokens, payload)
        .then(function (response) {
          console.log('Successfully sent message:', response)
        })
        .catch(function (error) {
          console.log('Error sending message:', error)
        })
    } else {
      console.log('Not tokens registered')
    }
  })
})
