import { ThemeState, initialState as themeInitialState } from './reducers/ThemeReducer';
import { AuthState, initialState as authInitialState } from './reducers/AuthReducer';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';
export const THEME_PERSISTENCE_KEY = 'THEME_TYPE';


export type State = {
  AuthReducer: AuthState,
  ThemeReducer: ThemeState
}

export type SimpleState = AuthState & ThemeState

// Initial State
export const initialState: State = {
  AuthReducer: authInitialState,
  ThemeReducer: themeInitialState
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
