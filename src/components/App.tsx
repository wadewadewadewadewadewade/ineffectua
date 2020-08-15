import * as React from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
import { store, persistor } from '../Store';
/*import {
  YellowBox,
} from 'react-native';*/
// eslint-disable-next-line import/no-unresolved
import { enableScreens } from 'react-native-screens';
import * as firebase from 'firebase';
import Navigation from './screens/Navigation';

const firebaseConfig = {
  apiKey: "AIzaSyAc7X0OaRKdN50CMAVQDu-EPrUBXhP58n4",
  authDomain: "ineffectua.firebaseapp.com",
  databaseURL: "https://ineffectua.firebaseio.com",
  projectId: "ineffectua",
  storageBucket: "ineffectua.appspot.com",
  messagingSenderId: "sender-id",
  appId: "1:616783557128:android:c473fc0abeb11b16",
  measurementId: "G-153557660"
};

firebase.initializeApp(firebaseConfig);

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
