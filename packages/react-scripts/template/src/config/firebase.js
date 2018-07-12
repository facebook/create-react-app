import firebase from 'firebase/app'
import config from './config'
// eslint-disable-next-line
//import firestore from 'firebase/firestore'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/messaging'

export const firebaseApp = firebase.initializeApp(process.env.NODE_ENV !== 'production' ? config.firebase_config_dev : config.firebase_config)
