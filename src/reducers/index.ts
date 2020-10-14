// Imports: Dependencies
import {combineReducers} from 'redux'; // Imports: Reducers
import AuthReducer, {Action as AuthAction} from './AuthReducer';
import ThemeReducer, {Action as ThemeAction} from './ThemeReducer';
import CalendarReducer, {Action as CalendarAction} from './CalendarReducer';
import DataTypesReducer, {Action as DataTypesAction} from './DataTypesReducer';
import ContactsReducer, {Action as ContactsAction} from './ContactsReducer';
import MedicationsReducer, {
  Action as MedicationsAction,
} from './MedicationsReducer';
import PainLogReducer, {Action as PainLogAction} from './PainLogReducer';
import TagsReducer, {Action as TagsAction} from './TagsReducer';
import PostsReducer, {Action as PostsAction} from './PostsReducer';

const SET_FETCHING = 'SET_FETCHING';

export type FetchingAction = {
  type: 'SET_FETCHING';
  isFetching: boolean;
};

export const isFetching = (is: boolean): FetchingAction => {
  return {type: SET_FETCHING, isFetching: is};
};

export type Action =
  | FetchingAction
  | AuthAction
  | ThemeAction
  | CalendarAction
  | DataTypesAction
  | ContactsAction
  | MedicationsAction
  | PainLogAction
  | TagsAction
  | PostsAction;

// Redux: Root Reducer
const rootReducer = combineReducers({
  user: AuthReducer,
  theme: ThemeReducer,
  dates: CalendarReducer,
  datatypes: DataTypesReducer,
  contacts: ContactsReducer,
  medications: MedicationsReducer,
  painlog: PainLogReducer,
  tags: TagsReducer,
  posts: PostsReducer,
}); // Exports
export default rootReducer;
