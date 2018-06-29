const functions = require('firebase-functions')
const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { console.log(e) }

exports = module.exports = functions.database.ref('/role_grants/{roleUid}/{grantUid}').onWrite((eventSnapshot, context) => {
  const roleUid = context.params.roleUid
  const grantUid = context.params.grantUid

  const userRolesRef = admin.database().ref(`user_roles`)

  return userRolesRef.once('value')
    .then((snapshot) => {
      let promises = []

      snapshot.forEach(userRoles => {
        const userUid = userRoles.key
        const roles = userRoles.val()

        Object.keys(roles).forEach((key, index) => {
          if (key === roleUid) {
            let grantRef = false

            console.log('User role changed:', eventSnapshot.val())

            if (eventSnapshot.val()) {
              grantRef = admin.database().ref(`user_grants/${userUid}/${grantUid}`).set(true)
            } else {
              grantRef = admin.database().ref(`user_grants/${userUid}/${grantUid}`).remove()
            }

            promises.push(grantRef)

            console.log('Role changed', userUid, roleUid, grantUid)
          }
        })
      })

      return Promise.all(promises)
    })
})
