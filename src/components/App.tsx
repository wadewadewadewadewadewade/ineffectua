import * as React from 'react';
import {YellowBox, Platform} from 'react-native';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider as ReduxProvider} from 'react-redux';
import {store, persistor} from '../Store';
import {enableScreens} from 'react-native-screens';
import Navigation from './Navigation';
import {QueryCache, ReactQueryCacheProvider} from 'react-query'; // https://react-query.tanstack.com/docs/guides/suspense
import {SafeAreaProvider} from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
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
    // https://docs.expo.io/versions/latest/sdk/notifications/
    Notifications.setNotificationChannelAsync('contacts', {
      name: 'Emergency Contacts',
      importance: Notifications.AndroidImportance.HIGH,
    });

    Notifications.scheduleNotificationAsync({
      identifier: 'contacts',
      content: {
        title: 'Person',
        body: 'Type: Name\nNumber',
      },
      trigger: {
        seconds: 2,
      },
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
