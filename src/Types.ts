import { MaterialBottomTabParams } from './components/MaterialBottomTabs';
import { ThemeState, initialState as themeInitialState } from './reducers/ThemeReducer';
import { AuthState, initialState as authInitialState } from './reducers/AuthReducer';
import { CalendarState, initialState as calendarInitialState } from './reducers/CalendarReducer';
import { DataTypesState, initialState as datatypesInitialState } from './reducers/DataTypesReducer';
import { ContactsState, initialState as contactsInitialState } from './reducers/ContactsReducer';
import { MedicationsState, initialState as medicationsInitialState } from './reducers/MedicationsReducer';

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';
export const THEME_PERSISTENCE_KEY = 'THEME_TYPE';


export type State =
    AuthState
  & ThemeState
  & CalendarState
  & DataTypesState
  & ContactsState
  & MedicationsState;

// Initial State
export const initialState: State = {
  user: authInitialState['user'],
  theme: themeInitialState['theme'],
  dates: calendarInitialState,
  datatypes: datatypesInitialState,
  contacts: contactsInitialState,
  medications: medicationsInitialState
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
  key?: string,
  typeId?: string,
  window: CalendarWindow,
  title: string,
  description?: string,
  contacts?: Array<string>
}

export type CalendarRecord = {
  window: CalendarWindow
  items: Array<CalendarEntry>
}

/*==== DataTypes ====*/

export type DataType = {
  key?: string,
  title: string,
  color: string
}

/*==== Contacts ====*/

export type Contact = {
  created?: Date,
  key?: string,
  typeId?: string,
  name: string,
  number?: string,
  email?: string,
  location?: string,
  description?: string
}

/*==== Medications ====*/

export type Medication = {
  created?: Date,
  key?: string,
  typeId?: string,
  name: string,
  active: boolean,
  prescribed?: string,
  lastFilled?: Date,
  refills?: number,
  description?: string
}
