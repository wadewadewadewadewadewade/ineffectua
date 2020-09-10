import thunk, { ThunkDispatch } from 'redux-thunk';
import { applyMiddleware } from 'redux';
//import { createLogger } from 'redux-logger';
import { firebase } from '../firebase/config';
import { State } from '../Types';
import { Action } from '../reducers';
import { getDates, watchDates } from './CalendarMiddleware';
import { getDataTypes, watchDataTypes } from './DataTypesMiddleware';
import { getContacts, watchContacts } from './ContactsMiddleware';
import { watchMedications, getMedications } from './MedicationsMiddleware';
//import AuthMiddleware from './AuthMiddleware';
//import CalendarMiddleware from './CalendarMiddleware';

export const getAndWatchData = (dispatch: ThunkDispatch<State, firebase.app.App, Action>) => {
  dispatch(watchDates());
  dispatch(watchDataTypes());
  dispatch(watchContacts());
  dispatch(watchMedications());
  return Promise.all([
    dispatch(getDates()),
    dispatch(getDataTypes()),
    dispatch(getContacts()),
    dispatch(getMedications()),
  ])
}

export default applyMiddleware(
  thunk.withExtraArgument(firebase),
  //createLogger(),
  //AuthMiddleware,
  //CalendarMiddleware
)
