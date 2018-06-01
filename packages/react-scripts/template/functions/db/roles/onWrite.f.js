const functions = require('firebase-functions')
const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { }

exports = module.exports = functions.database.ref('/roles/{roleUid}').onWrite((eventSnap, context) => {
  // Exit when the data is not deleted.
  if (eventSnap.after.exists()) {
    return
  }

  const roleUid = context.params.roleUid

  return admin.database().ref(`role_grants/${roleUid}`).remove()
})
