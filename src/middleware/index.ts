import thunk from 'redux-thunk';
import { applyMiddleware } from 'redux';
//import { createLogger } from 'redux-logger';
import { firebase } from '../firebase/config';
//import AuthMiddleware from './AuthMiddleware';
//import CalendarMiddleware from './CalendarMiddleware';

export default applyMiddleware(
  thunk.withExtraArgument(firebase),
  //createLogger(),
  //AuthMiddleware,
  //CalendarMiddleware
)
