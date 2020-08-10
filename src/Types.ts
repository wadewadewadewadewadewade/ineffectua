import { firestore } from 'firebase';
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

interface CalendarEntry {
  starts: Date,
  ends: Date,
  title: string,
  description: string | undefined,
  contacts: Array<string> | undefined
}

export class CalendarEntryType implements CalendarEntry {
  starts: Date = new Date();
  ends: Date = new Date();
  title: string = '';
  description: string | undefined;
  contacts: Array<string> | undefined;
  constructor (starts: Date, ends: Date, title: string, description?: string, contacts?: Array<string>) {
    const keys: Array<string> = Object.keys(arguments);
    this.starts = starts;
    this.ends = ends;
    this.title = title;
    this.description = description;
    this.contacts = contacts;
  }
}

// Firestore data converter
export const calendarTypeEntryConverter = {
  toFirestore: function(date: CalendarEntryType) {
    return date
  },
  fromFirestore: function(snapshot: firestore.QueryDocumentSnapshot<firestore.DocumentData>, options: any){
    const data = snapshot.data(options);
    return new CalendarEntryType(data.starts, data.ends, data.title, data.description, data.contacts)
  }
}