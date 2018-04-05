const admin = require('firebase-admin')
try {
  admin.initializeApp()
} catch (e) {
  console.log(e)
}

module.exports = {
  admin
}
