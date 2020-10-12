import * as React from 'react';
import { YellowBox } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
import { store, persistor } from '../Store';
// eslint-disable-next-line import/no-unresolved
import { enableScreens } from 'react-native-screens';
import Navigation from './Navigation';
import { QueryCache, ReactQueryCacheProvider } from 'react-query' // https://react-query.tanstack.com/docs/guides/suspense
enableScreens();

const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      suspense: true,
    },
  },
})

export default function App() {
  YellowBox.ignoreWarnings(['Setting a timer']); // Firebase uses long timers
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <Navigation />
        </ReactQueryCacheProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
