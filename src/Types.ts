import { MaterialBottomTabParams } from './components/MaterialBottomTabs';
import { ThemeState, initialState as themeInitialState } from './reducers/ThemeReducer';
import { AuthState, initialState as authInitialState } from './reducers/AuthReducer';
import { CalendarState, initialState as calendarInitialState } from './reducers/CalendarReducer';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';
export const THEME_PERSISTENCE_KEY = 'THEME_TYPE';


export type State = AuthState & ThemeState & CalendarState;

// Initial State
export const initialState: State = {
  user: authInitialState['user'],
  theme: themeInitialState['theme'],
  dates: calendarInitialState['dates']
}

export type RootDrawerParamList = {
  Root: undefined;
  Another: undefined;
};

export type RootStackParamList = {
  Tabs: MaterialBottomTabParams
  AuthFlow: undefined;
  NotFound: undefined;
  ModalScreen: undefined;
};

/*==== Calendar ====*/

export type CalendarWindow = {
  starts: Date,
  ends: Date
}

export interface CalendarEntry {
  window: CalendarWindow,
  title: string,
  description: string | undefined,
  contacts: Array<string> | undefined
}

export type CalendarRecord = {
  window: CalendarWindow
  items: Array<CalendarEntry>
}
