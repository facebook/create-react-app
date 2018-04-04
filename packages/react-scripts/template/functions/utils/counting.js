const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { } // You do that because the admin SDK can only be initialized once.

module.exports = {
  handleListChange: (data, context, counterName) => {
    if (data.exists() && data.previous.exists()) {
      return
    }

    const collectionRef = event.data.adminRef.parent
    const countRef = collectionRef.parent.child(counterName)

    // Return the promise from countRef.transaction() so our function
    // waits for this async event to complete before it exits.
    return countRef.transaction(current => {
      if (data.exists()) {
        return (current || 0) + 1
      } else {
        return (current || 0) - 1
      }
    }).then(() => {
      console.log(`${counterName} counter updated.`)
    })
  },
  handleRecount: (data, context, listName, correction = 0) => {
    if (!data.exists()) {
      const counterRef = data.adminRef
      const collectionRef = counterRef.parent.child(listName)

      // Return the promise from counterRef.set() so our function
      // waits for this async event to complete before it exits.
      return collectionRef.once('value')
        .then(messagesData => counterRef.set(messagesData.numChildren() + correction))
    }
  }
}
