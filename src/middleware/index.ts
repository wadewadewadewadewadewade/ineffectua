import thunk from 'redux-thunk';
import { applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { firebase } from '../firebase/config';

export default applyMiddleware(
  thunk.withExtraArgument(firebase),
  createLogger(),
)
