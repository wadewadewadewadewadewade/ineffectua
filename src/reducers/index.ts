// Imports: Dependencies
import { combineReducers } from 'redux';// Imports: Reducers
import AuthReducer, { Action as AuthAction } from './AuthReducer';
import ThemeReducer, { Action as ThemeAction } from './ThemeReducer';

export type Action = AuthAction | ThemeAction;

// Redux: Root Reducer
const rootReducer = combineReducers({
  AuthReducer: AuthReducer,
  ThemeReducer: ThemeReducer,
});// Exports
export default rootReducer;