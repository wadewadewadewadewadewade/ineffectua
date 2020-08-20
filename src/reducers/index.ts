// Imports: Dependencies
import { combineReducers } from 'redux';// Imports: Reducers
import AuthReducer, { Action as AuthAction } from './AuthReducer';
import ThemeReducer, { Action as ThemeAction } from './ThemeReducer';
import CalendarReducer, { Action as CalendarAction }  from './CalendarReducer';

export type Action = AuthAction | ThemeAction | CalendarAction;

// Redux: Root Reducer
const rootReducer = combineReducers({
  user: AuthReducer,
  theme: ThemeReducer,
  dates: CalendarReducer
});// Exports
export default rootReducer;