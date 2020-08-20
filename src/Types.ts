import { firestore } from 'firebase';
import { ThemeState, initialState as themeInitialState } from './reducers/ThemeReducer';
import { AuthState, initialState as authInitialState } from './reducers/AuthReducer';
import { CalendarState, initialState as calendarInitialState } from './reducers/CalendarReducer';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';
export const THEME_PERSISTENCE_KEY = 'THEME_TYPE';


export type State = {
  user: AuthState['user'],
  theme: ThemeState['theme'],
  dates: CalendarState['dates']
}

export type SimpleState = AuthState & ThemeState

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
  Tabs: undefined
  AuthFlow: undefined;
  NotFound: undefined;
  ModalScreen: undefined;
};
