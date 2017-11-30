const functions = require('firebase-functions');
const admin = require('firebase-admin');
try {
  admin.initializeApp(functions.config().firebase);
} catch (e) {} // You do that because the admin SDK can only be initialized once.
const nodemailer = require('nodemailer');
const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);
const mailTransport = nodemailer.createTransport(
  `smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`
);

exports = module.exports = functions.auth.user().onCreate(event => {
  const user = event.data; // The Firebase user.
  const email = user.email; // The email of the user.
  const displayName = user.displayName; // The display name of the user.
  const year = event.data.metadata.creationTime.slice(0, 4);
  const month = event.data.metadata.creationTime.slice(5, 7);
  const day = event.data.metadata.creationTime.slice(8, 10);

  const dayCount = admin
    .database()
    .ref(`/user_registrations_per_day/${year}/${month}/${day}`)
    .transaction(current => (current || 0) + 1);

  const monthCount = admin
    .database()
    .ref(`/user_registrations_per_month/${year}/${month}`)
    .transaction(current => (current || 0) + 1);

  let promises = [dayCount, monthCount];

  if (email) {
    const mailOptions = {
      from: '"Tarik Huber" <huber.tarik@gmail.com>',
      to: email,
      subject: `Welcome to React Most Wanted!`,
      text: `Hey ${displayName}!, Welcome to React Most Wanted. I hope you will enjoy the demo application.`,
    };

    promises.push(mailTransport.sendMail(mailOptions));
  }

  return Promise.all(promises).then(results => {
    console.log(results);
  });
});
