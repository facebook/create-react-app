import firebase from 'firebase'
import config from './config'

export const firebaseApp = firebase.initializeApp(process.env.NODE_ENV !== 'production' ? config.firebase_config_dev : config.firebase_config)
export default firebaseApp
