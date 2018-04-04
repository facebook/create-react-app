const functions = require('firebase-functions')
const counting = require('../../utils/counting')

exports = module.exports = functions.database.ref('/public_tasks_count').onWrite(
  (data, context) => counting.handleRecount(data, context, 'public_tasks')
)
