import { MaterialBottomTabParams } from './components/MaterialBottomTabs';
import { ThemeState, initialState as themeInitialState } from './reducers/ThemeReducer';
import { AuthState, initialState as authInitialState } from './reducers/AuthReducer';
import { CalendarEntry, CalendarState, initialState as calendarInitialState } from './reducers/CalendarReducer';
import { DataType, DataTypesState, initialState as datatypesInitialState } from './reducers/DataTypesReducer';
import { Contact, ContactsState, initialState as contactsInitialState } from './reducers/ContactsReducer';
import { Medication, MedicationsState, initialState as medicationsInitialState } from './reducers/MedicationsReducer';
import { PainLogLocation, PainLogState, initialState as painLogInitialState } from './reducers/PainLogReducer';
import { Tag, TagsState, initialState as tagsInitialState } from './reducers/TagsReducer';
import { Post, PostsState, initialState as postsInitialSate } from './reducers/PostsReducer';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';
export const THEME_PERSISTENCE_KEY = 'THEME_TYPE';

export type AllTypes =
    CalendarEntry
  | DataType
  | Contact
  | Medication
  | PainLogLocation
  | Tag
  | Post

export type State =
    AuthState
  & ThemeState
  & CalendarState
  & DataTypesState
  & ContactsState
  & MedicationsState
  & PainLogState
  & TagsState
  & PostsState

// Initial State
export const initialState: State = {
  user: authInitialState['user'],
  theme: themeInitialState['theme'],
  dates: calendarInitialState,
  datatypes: datatypesInitialState,
  contacts: contactsInitialState,
  medications: medicationsInitialState,
  painlog: painLogInitialState,
  tags: tagsInitialState,
  posts: postsInitialSate,
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
