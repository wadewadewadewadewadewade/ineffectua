import * as firebase from 'firebase';
import '@firebase/auth';
import '@firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAc7X0OaRKdN50CMAVQDu-EPrUBXhP58n4',
  authDomain: 'ineffectua.firebaseapp.com',
  databaseURL: 'https://ineffectua.firebaseio.com',
  projectId: 'ineffectua',
  storageBucket: 'ineffectua.appspot.com',
  //messagingSenderId: '12345-insert-yourse',
  appId: '1:616783557128:android:c473fc0abeb11b16',
};

if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    /*firebase.firestore().enablePersistence()
      .catch(function(err) {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
            // ...
        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
        }
        console.warn(err);
    });*/
  } catch (err) {
    // not an actual error when we're hot-reloading
    if (!/(already exists|Setting a timer for a long period of time)/.test(err.message)) {
      console.error('Firebase initialization error', err.stack)
    }
  }
}

export { firebase };
