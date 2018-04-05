const functions = require('firebase-functions')
const admin = require('../../admin')
const notifications = require('../../utils/notifications')

exports = module.exports = functions.database.ref('/user_chat_messages/{senderUid}/{receiverUid}/{messageUid}').onCreate((eventSnapshot, context) => {
  if (context.authType === 'ADMIN') {
    return null
  }

  const senderUid = context.params.senderUid
  const receiverUid = context.params.receiverUid
  const messageUid = context.params.messageUid
  const snapValues = eventSnapshot.val()
  const senderChatRef = admin.database().ref(`/user_chats/${senderUid}/${receiverUid}`)
  const receiverChatRef = admin.database().ref(`/user_chats/${receiverUid}/${senderUid}`)
  const receiverChatUnreadRef = admin.database().ref(`/user_chats/${receiverUid}/${senderUid}/unread`)
  const receiverChatMessageRef = admin.database().ref(`/user_chat_messages/${receiverUid}/${senderUid}/${messageUid}`)
  const senderChatMessageRef = admin.database().ref(`/user_chat_messages/${senderUid}/${receiverUid}/${messageUid}`)

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

  const udateReceiverChatMessage = receiverChatMessageRef.update(snapValues).then(() => {
    senderChatMessageRef.update({
      isSend: context.timestamp
    })
  })

  const udateSenderChat = senderChatRef.update({
    unread: 0,
    lastMessage: lastMessage,
    authorUid: senderUid,
    lastCreated: snapValues.created,
    isSend: context.timestamp,
    isRead: null
  })
  const udateReceiverChat = receiverChatRef.update({
    displayName: snapValues.authorName,
    authorUid: senderUid,
    photoURL: snapValues.authorPhotoUrl ? snapValues.authorPhotoUrl : '',
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

    notifyUser = notifications.notifyUser(receiverUid, payload).then(() => {
      senderChatMessageRef.update({
        isReceived: context.timestamp
      }).then(() => {
        senderChatRef.update({
          isReceived: context.timestamp
        })
      })
    })
  }

  return Promise.all([
    udateReceiverChatMessage,
    udateSenderChat,
    udateReceiverChat,
    updateReceiverUnred,
    notifyUser
  ])
})
