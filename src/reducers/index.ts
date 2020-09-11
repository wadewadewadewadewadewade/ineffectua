// Imports: Dependencies
import { combineReducers } from 'redux';// Imports: Reducers
import AuthReducer, { Action as AuthAction } from './AuthReducer';
import ThemeReducer, { Action as ThemeAction } from './ThemeReducer';
import CalendarReducer, { Action as CalendarAction }  from './CalendarReducer';
import DataTypesReducer, { Action as DataTypesAction } from './DataTypesReducer';
import ContactsReducer, { Action as ContactsAction } from './ContactsReducer';
import MedicationsReducer, { Action as MedicationsAction } from './MedicationsReducer';
import PainLogReducer, { Action as PainLogAction } from './PainLogReducer';

const SET_FETCHING = 'SET_FETCHING';

export type FetcingAction = {
  type: 'SET_FETCHING'
  isFetching: boolean
}

export const isFetching = (is: boolean): FetcingAction => {
  return { type: 'SET_FETCHING', isFetching: is }
}

export type Action =
    FetcingAction
  | AuthAction
  | ThemeAction
  | CalendarAction
  | DataTypesAction
  | ContactsAction
  | MedicationsAction
  | PainLogAction

// Redux: Root Reducer
const rootReducer = combineReducers({
  user: AuthReducer,
  theme: ThemeReducer,
  dates: CalendarReducer,
  datatypes: DataTypesReducer,
  contacts: ContactsReducer,
  medications: MedicationsReducer,
  painlog: PainLogReducer,
});// Exports
export default rootReducer;