import firebase from 'firebase/app'
import config from './config'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'
import 'firebase/firestore'
import 'firebase/messaging'
import 'firebase/performance'

const firebaseApp = firebase.initializeApp(
  process.env.NODE_ENV !== 'production' ? config.firebase_config_dev : config.firebase_config
)

firebase
  .firestore()
  .enablePersistence({ synchronizeTabs: true })
  .catch(function(err) {
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

const perf = firebase.performance()

export { firebaseApp, perf }
export default firebaseApp
