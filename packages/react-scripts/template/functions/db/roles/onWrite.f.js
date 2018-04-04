const functions = require('firebase-functions')
const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { } // You do that because the admin SDK can only be initialized once.

exports = module.exports = functions.database.ref('/roles/{roleUid}').onWrite((data, context) => {
  // Exit when the data is not deleted.
  if (data.exists()) {
    return
  }

  const roleUid = context.params.roleUid

  return admin.database().ref(`role_grants/${roleUid}`).remove()
})
