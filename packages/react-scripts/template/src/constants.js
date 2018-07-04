import firebase from 'firebase'
let config = {
  apiKey: "AIzaSyAuVLMl6rnxtvhfn0or61aHE6xtkAeuFYo",
  authDomain: "cdn.augle.me",
  databaseURL: "https://knowb4-f50c6.firebaseio.com",
  projectId: "knowb4-f50c6",
  storageBucket: "knowb4-f50c6.appspot.com",
  messagingSenderId: "462265038765"
};
firebase.initializeApp(config)
export const ref = firebase.database().ref()
//export const secondApp = firebase.initializeApp(config2, "second");
export const firebaseAuth = firebase.auth
export const storeageRef = firebase.storage().ref();