import AsyncStorage from '@react-native-community/async-storage';
import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist'; // Imports: Redux
import rootReducer, { reducerNames } from './reducers'; // Redux Persist Config
import middleware from './middleware';

const persistConfig = {
  // Root
  key: 'root',
  // Storage Method (React Native)
  storage: AsyncStorage,
  // Whitelist (Save Specific Reducers)
  whitelist: [
    'AuthReducer',
    'ThemeReducer',
  ],
  // Blacklist (Don't Save Specific Reducers)
  blacklist: [
    'CalendarReducer',
    'DataTypesReducer',
    'ContactsReducer',
    'MedicationsReducer',
    'PainLogReducer',
  ],
};// Middleware: Redux Persist Persisted Reducer

const persistedReducer = persistReducer(persistConfig, rootReducer);// Redux: Store

const store = createStore(
  persistedReducer,
  middleware
);// Middleware: Redux Persist Persister

let persistor = persistStore(store);// Exports

export {
  store,
  persistor,
};