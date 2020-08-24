import * as React from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
import { store, persistor } from '../Store';
/*import {
  YellowBox,
} from 'react-native';*/
// eslint-disable-next-line import/no-unresolved
import { enableScreens } from 'react-native-screens';
import firebase from '@react-native-firebase/app';
import Navigation from './screens/Navigation';

const firebaseConfig = {
  appId: 'com.ineffectua',
  apiKey: "AIzaSyAc7X0OaRKdN50CMAVQDu-EPrUBXhP58n4",
  authDomain: "ineffectua.firebaseapp.com",
  projectId: "ineffectua",
};

try {
  firebase.initializeApp(firebaseConfig);
  /*firestore().enablePersistence()
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
  if (!/already exists/.test(err.message)) {
    console.error('Firebase initialization error', err.stack)
  }
}

//YellowBox.ignoreWarnings(['Require cycle:', 'Warning: Async Storage']);

enableScreens();

export default function App() {

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Navigation />
      </PersistGate>
    </ReduxProvider>
  );
}
