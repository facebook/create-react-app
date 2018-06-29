const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { console.log(e) }

module.exports = {
  notifyUser: (userUid, payload) => {
    console.log(userUid, payload)

    return admin.database().ref(`/notification_tokens/${userUid}`).once('value').then(snapshot => {
      let registrationTokens = []

      snapshot.forEach(token => {
        if (token.val()) {
          registrationTokens.push(token.key)
        }
      })

      if (registrationTokens.length) {
        return admin.messaging().sendToDevice(registrationTokens, payload)
      } else {
        console.log('Not tokens registered')
        return null
      }
    })
  }

}
