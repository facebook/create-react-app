module.exports = {
  handleListChange: (data, context, counterName) => {
    if (data.after.exists() && data.before.exists()) {
      return null
    }

    const collectionRef = data.after.ref.parent
    const countRef = collectionRef.parent.child(counterName)

    // Return the promise from countRef.transaction() so our function
    // waits for this async event to complete before it exits.
    return countRef.transaction(current => {
      if (data.after.exists()) {
        return (current || 0) + 1
      } else {
        return (current || 0) - 1
      }
    })
  },
  handleRecount: (data, context, listName, correction = 0) => {
    if (!data.exists()) {
      const counterRef = data.ref
      const collectionRef = counterRef.parent.child(listName)

      // Return the promise from counterRef.set() so our function
      // waits for this async event to complete before it exits.
      return collectionRef.once('value')
        .then(messagesData => counterRef.set(messagesData.numChildren() + correction))
    }
    return null
  }
}
