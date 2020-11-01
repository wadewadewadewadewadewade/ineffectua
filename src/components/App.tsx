import * as React from 'react';
import {YellowBox, Platform} from 'react-native';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider as ReduxProvider} from 'react-redux';
import {store, persistor} from '../Store';
import {enableScreens} from 'react-native-screens';
import Navigation from './Navigation';
import {QueryCache, ReactQueryCacheProvider} from 'react-query'; // https://react-query.tanstack.com/docs/guides/suspense
import {SafeAreaProvider} from 'react-native-safe-area-context';
import PushNotification from 'react-native-push-notification';
enableScreens();

const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      suspense: true,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    },
  },
});

export default function App() {
  YellowBox.ignoreWarnings(['Setting a timer']); // Firebase uses long timers
  if (Platform.OS !== 'web') {
    PushNotification.localNotification((notification) => {
      // https://github.com/zo0r/react-native-push-notification#readme
      console.log('Initial Notification', notification);
    });
  }
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <SafeAreaProvider>
            <Navigation />
          </SafeAreaProvider>
        </ReactQueryCacheProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
