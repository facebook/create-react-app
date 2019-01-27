const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { console.log(e) }

// Source: https://firebase.google.com/docs/auth/admin/manage-users
const listAllUsers = (userIds = [], nextPageToken) => {
  // List batch of users, 1000 at a time.
  return admin.auth().listUsers(1000, nextPageToken)
    .then(resp => {
      if (resp.pageToken) {
        // List next batch of users.
        return listAllUsers(userIds.concat(resp.users), resp.pageToken)
      }
      return userIds.concat(resp.users)
    })
}

module.exports = {
  listAllUsers: listAllUsers
}
