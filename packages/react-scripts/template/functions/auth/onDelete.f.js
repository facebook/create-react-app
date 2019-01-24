const functions = require('firebase-functions')
const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { console.log(e) }
const nodemailer = require('nodemailer')
const gmailEmail = encodeURIComponent(functions.config().gmail ? functions.config().gmail.email : '')
const gmailPassword = encodeURIComponent(functions.config().gmail ? functions.config().gmail.password : '')
const mailTransport = nodemailer.createTransport(`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`)

exports = module.exports = functions.auth.user().onDelete((userMetadata, context) => {
  const uid = userMetadata.uid
  const email = userMetadata.email
  const displayName = userMetadata.displayName

  console.log(userMetadata.providerData)
  console.log(userMetadata)
  console.log(context)

  const provider = userMetadata.providerData.length ? userMetadata.providerData[0] : { providerId: email ? 'password' : 'phone' }
  const providerId = provider.providerId ? provider.providerId.replace('.com', '') : provider.providerId

  let promises = []

  const mailOptions = {
    from: `"Tarik Huber" <${gmailEmail}>`,
    to: email,
    subject: `Bye!`,
    text: `Hey ${displayName || ''}!, We confirm that we have deleted your React Most Wanted account.`
  }

  const sendEmail = mailTransport.sendMail(mailOptions).then(() => {
    console.log('Account deletion confirmation email sent to:', email)
    return null
  })

  const deleteUser = admin.database().ref(`/users/${uid}`).set(null)
  const deleteTokens = admin.database().ref(`/notification_tokens/${uid}`).set(null)
  const deleteChats = admin.database().ref(`/users_chats/${uid}`).set(null)

  const usersCount = admin.database()
    .ref(`/users_count`)
    .transaction(current => (current || 0) - 1)

  if (providerId) {
    promises.push(
      admin.database()
        .ref(`/provider_count/${providerId}`)
        .transaction(current => (current || 0) - 1)
    )
  }

  promises.push(sendEmail, deleteUser, usersCount, deleteTokens, deleteChats)

  return Promise.all(promises)
})
