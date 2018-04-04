const functions = require('firebase-functions')
const counting = require('../../utils/counting')

exports = module.exports = functions.database.ref('/public_tasks/{taskUid}').onWrite((data, context) => {
  return Promise.all([
    counting.handleListChange(data, context, 'public_tasks_count')
  ])
})
