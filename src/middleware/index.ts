import * as React from 'react';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { applyMiddleware } from 'redux';
//import { createLogger } from 'redux-logger';
import { firebase } from '../firebase/config';
import { State, AllTypes } from '../Types';
import { Action } from '../reducers';
import { getDates, watchDates } from './CalendarMiddleware';
import { getDataTypes, watchDataTypes } from './DataTypesMiddleware';
import { getContacts, watchContacts } from './ContactsMiddleware';
import { watchMedications, getMedications } from './MedicationsMiddleware';
import { watchPainLog, getPainLog } from './PainLogMiddleware';

export function firebaseDocumentToArray<T>(items: {[index: string]: T}, optionalItem?: T) {
  const itemsAsArray = React.useMemo<Array<T>>(() => {
    const arr = new Array<T>();
    if (items) {
      const keys = Object.keys(items);
      for(let i=0;i<keys.length;i++) {
        const l: unknown = items[keys[i]];
        if (l) (l as AllTypes).key = keys[i]
        arr.push(l as T);
      }
    }
    if (optionalItem) {
      arr.push(optionalItem)
    }
    return arr;
  }, [items])
  return itemsAsArray
}

export const watchFirebaseData = (dispatch: ThunkDispatch<State, firebase.app.App, Action>) => {
  return new Promise<void>((s,f) => {
    Promise.all([
      dispatch(watchDates()),
      dispatch(watchDataTypes()),
      dispatch(watchContacts()),
      dispatch(watchMedications()),
      dispatch(watchPainLog()),
    ]).then(() => s()).catch((e) => f(e))
  })
}

export const getFirebaseData = (dispatch: ThunkDispatch<State, firebase.app.App, Action>) => {
  return new Promise<void>((s,f) => {
    Promise.all([
      dispatch(getDates()),
      dispatch(getDataTypes()),
      dispatch(getContacts()),
      dispatch(getMedications()),
      dispatch(getPainLog()),
    ]).then(() => s()).catch((e) => f(e))
  })
}

export default applyMiddleware(
  thunk.withExtraArgument(firebase),
  //createLogger(),
  //AuthMiddleware,
  //CalendarMiddleware
)
