import firebase from 'firebase/app'
import config from './config'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'
import 'firebase/firestore'
import 'firebase/messaging'

const firebaseApp = firebase.initializeApp(process.env.NODE_ENV !== 'production' ? config.firebase_config_dev : config.firebase_config)

const settings = { timestampsInSnapshots: true }
firebase.firestore().settings(settings)

firebase.firestore().enablePersistence({ experimentalTabSynchronization: true })
  .catch(function (err) {
    if (err.code === 'failed-precondition') {
      console.log('failed-precondition')
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
      // ...
    } else if (err.code === 'unimplemented') {
      console.log('unimplemented')
      // The current browser does not support all of the
      // features required to enable persistence
      // ...
    }
  })

export { firebaseApp }
export default firebaseApp
