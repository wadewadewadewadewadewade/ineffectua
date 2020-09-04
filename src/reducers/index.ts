// Imports: Dependencies
import { combineReducers } from 'redux';// Imports: Reducers
import AuthReducer, { Action as AuthAction } from './AuthReducer';
import ThemeReducer, { Action as ThemeAction } from './ThemeReducer';
import CalendarReducer, { Action as CalendarAction }  from './CalendarReducer';
import DataTypesReducer, { Action as DataTypesAction } from './DataTypesReducer';

const SET_FETCHING = 'SET_FETCHING';

export type FetcingAction = {
  type: 'SET_FETCHING'
  isFetching: boolean
}

export const isFetching = (is: boolean): FetcingAction => {
  return { type: 'SET_FETCHING', isFetching: is }
}

export type Action = FetcingAction | AuthAction | ThemeAction | CalendarAction | DataTypesAction;

// Redux: Root Reducer
const rootReducer = combineReducers({
  user: AuthReducer,
  theme: ThemeReducer,
  dates: CalendarReducer,
  datatypes: DataTypesReducer
});// Exports
export default rootReducer;