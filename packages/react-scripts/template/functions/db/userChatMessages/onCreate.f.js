const functions = require('firebase-functions')
const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { console.log(e) }
const notifications = require('../../utils/notifications')

exports = module.exports = functions.database.ref('/user_chat_messages/{senderUid}/{receiverUid}/{messageUid}').onCreate((eventSnapshot, context) => {
  if (context.authType === 'ADMIN') {
    return null
  }

  const senderUid = context.params.senderUid
  const receiverUid = context.params.receiverUid
  const messageUid = context.params.messageUid
  const snapValues = eventSnapshot.val()
  const senderRef = admin.database().ref(`/users/${senderUid}`).once('value')
  const receiverRef = admin.database().ref(`/users/${receiverUid}`).once('value')
  const senderChatRef = admin.database().ref(`/user_chats/${senderUid}/${receiverUid}`)
  const receiverChatRef = admin.database().ref(`/user_chats/${receiverUid}/${senderUid}`)
  const receiverChatUnreadRef = admin.database().ref(`/user_chats/${receiverUid}/${senderUid}/unread`)
  const receiverChatMessageRef = admin.database().ref(`/user_chat_messages/${receiverUid}/${senderUid}/${messageUid}`)
  const senderChatMessageRef = admin.database().ref(`/user_chat_messages/${senderUid}/${receiverUid}/${messageUid}`)
  const setSenderMessageReceived = () => senderChatMessageRef.update({ isReceived: context.timestamp })
  const setSenderChatReceived = () => senderChatRef.update({ isReceived: context.timestamp })
  const setIsSendMessage = () => senderChatMessageRef.update({ isSend: context.timestamp })
  const udateReceiverChatMessage = (snapValues) => receiverChatMessageRef.update(snapValues).then(setIsSendMessage)
  const executeUserNotification = (receiverUid, payload) => notifications.notifyUser(receiverUid, payload)
    .then(setSenderMessageReceived)
    .then(setSenderChatReceived)

  console.log(`Message ${messageUid} ${snapValues.message} created! Sender ${senderUid}, receiver ${receiverUid}`)

  let lastMessage = snapValues.message

  if (!lastMessage) {
    if (snapValues.link) {
      lastMessage = 'Link'
    }
    if (snapValues.image) {
      lastMessage = 'Image'
    }
    if (snapValues.location) {
      lastMessage = 'Position'
    }
    if (snapValues.audio) {
      lastMessage = 'Audio'
    }
  }

  return Promise.all([senderRef, receiverRef]).then(results => {
    const senderSnap = results[0]
    const receiverSnap = results[1]

    udateReceiverChatMessage()

    const udateSenderChat = senderChatRef.update({
      unread: 0,
      displayName: receiverSnap.child('displayName').val(),
      photoURL: receiverSnap.child('photoURL').val(),
      lastMessage: lastMessage,
      authorUid: senderUid,
      lastCreated: snapValues.created,
      isSend: context.timestamp,
      isRead: null
    })
    const udateReceiverChat = receiverChatRef.update({
      displayName: senderSnap.child('displayName').val(),
      photoURL: senderSnap.child('photoURL').val(),
      authorUid: senderUid,
      lastMessage: lastMessage,
      lastCreated: snapValues.created,
      isSend: context.timestamp,
      isRead: null
    })
    const updateReceiverUnred = receiverChatUnreadRef.transaction(number => {
      return (number || 0) + 1
    })

    let notifyUser = null

    if (snapValues.authorUid !== receiverUid) {
      const payload = {
        notification: {
          title: `${snapValues.authorName} `,
          body: lastMessage,
          icon: snapValues.authorPhotoUrl || '/apple-touch-icon.png',
          click_action: `https://www.react-most-wanted.com/chats/edit/${senderUid}`,
          tag: `chat`
        }
      }

      executeUserNotification(receiverUid, payload)
    }

    return Promise.all([
      udateReceiverChatMessage,
      udateSenderChat,
      udateReceiverChat,
      updateReceiverUnred,
      notifyUser
    ])
  })
})
