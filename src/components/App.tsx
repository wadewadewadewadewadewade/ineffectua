import * as React from 'react';
import { YellowBox } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
import { store, persistor } from '../Store';
// eslint-disable-next-line import/no-unresolved
import { enableScreens } from 'react-native-screens';
import Navigation from './Navigation';

enableScreens();

export default function App() {
  YellowBox.ignoreWarnings(['Setting a timer']); // Firebase uses long timers
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Navigation />
      </PersistGate>
    </ReduxProvider>
  );
}
