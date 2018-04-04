const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { } // You do that because the admin SDK can only be initialized once.

// Source: https://firebase.google.com/docs/auth/admin/manage-users
const listAllUsers = (userIds = [], nextPageToken) => {
  // List batch of users, 1000 at a time.
  return admin.auth().listUsers(1000, nextPageToken)
    .then(function (resp) {
      /*
      listUsersResult.users.forEach(function (userRecord) {
        console.log('user', userRecord.toJSON())
      })
      */
      if (resp.pageToken) {
        // List next batch of users.
        return listAllUsers(userIds.concat(resp.users), resp.pageToken)
      }
      return userIds.concat(resp.users)
    })
    .catch(function (error) {
      console.log('Error listing users:', error)
    })
}

module.exports = {
  listAllUsers: listAllUsers
}
