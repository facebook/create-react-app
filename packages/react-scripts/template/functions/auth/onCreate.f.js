const functions = require('firebase-functions')
const admin = require('firebase-admin')
try { admin.initializeApp() } catch (e) { console.log(e) }
const nodemailer = require('nodemailer')
const gmailEmail = encodeURIComponent(functions.config().gmail ? functions.config().gmail.email : '')
const gmailPassword = encodeURIComponent(functions.config().gmail ? functions.config().gmail.password : '')
const mailTransport = nodemailer.createTransport(`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`)
const moment = require('moment')

exports = module.exports = functions.auth.user().onCreate((uRecord, context) => {
  const userRecord = uRecord || {}
  const email = userRecord.email // The email of the user.
  const displayName = userRecord.displayName // The display name of the user.
  const creationTime = moment(userRecord.creationTime)
  const year = creationTime.format('YYYY')
  const month = creationTime.format('MM')
  const day = creationTime.format('DD')

  return admin.auth().getUser(userRecord.uid).then(user => {
    // User  without provider data
    console.log('Event user data', userRecord)

    // User with provider data
    console.log('Auth user data', user)

    const provider = user.providerData !== [] ? user.providerData[0] : { providerId: email ? 'password' : 'phone' }
    const providerId = provider.providerId ? provider.providerId.replace('.com', '') : provider.providerId

    let promises = []

    if (providerId) {
      promises.push(
        admin.database()
          .ref(`/provider_count/${providerId}`)
          .transaction(current => (current || 0) + 1)
      )
    }

    const dayCount = admin.database().ref(`/user_registrations_per_day/${year}/${month}/${day}`).transaction(current => (current || 0) + 1)

    const monthCount = admin.database()
      .ref(`/user_registrations_per_month/${year}/${month}`)
      .transaction(current => (current || 0) + 1)

    const usersCount = admin.database()
      .ref(`/users_count`)
      .transaction(current => (current || 0) + 1)

    promises.push(dayCount, monthCount, usersCount)

    if (email) {
      const mailOptions = {
        from: `"Tarik Huber" <${gmailEmail}>`,
        to: email,
        subject: `Welcome to React Most Wanted!`,
        text: `Hey ${displayName || ''}!, Welcome to React Most Wanted. I hope you will enjoy the demo application.`
      }

      promises.push(mailTransport.sendMail(mailOptions))
    }

    return Promise.all(promises)
  })
})
