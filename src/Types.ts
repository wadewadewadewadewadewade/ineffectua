import {MaterialBottomTabParams} from './components/MaterialBottomTabs';
import {
  ThemeState,
  initialState as themeInitialState,
} from './reducers/ThemeReducer';
import {
  AuthState,
  initialState as authInitialState,
} from './reducers/AuthReducer';
import {CalendarEntry} from './reducers/CalendarReducer';
import {DataType} from './reducers/DataTypesReducer';
import {Contact} from './reducers/ContactsReducer';
import {Medication} from './reducers/MedicationsReducer';
import {PainLogLocation} from './reducers/PainLogReducer';
import {Tag} from './reducers/TagsReducer';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';
export const THEME_PERSISTENCE_KEY = 'THEME_TYPE';

export type AllTypes =
  | CalendarEntry
  | DataType
  | Contact
  | Medication
  | PainLogLocation
  | Tag;

export type State = AuthState & ThemeState;

// Initial State
export const initialState: State = {
  user: authInitialState.user,
  theme: themeInitialState.theme,
};

export type RootDrawerParamList = {
  Root: undefined;
  Another: undefined;
};

export type RootStackParamList = {
  Tabs: MaterialBottomTabParams;
  AuthFlow: undefined;
  NotFound: undefined;
  Profile: {userId?: string};
};
