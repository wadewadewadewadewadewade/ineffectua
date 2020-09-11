import * as React from 'react';
import { State } from './../Types';
import { GetPainLogAction, ReplacePainLogAction, PainLogState } from '../reducers/PainLogReducer';
import { Action, isFetching } from './../reducers';
import { PainLogLocation } from './../reducers/PainLogReducer';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { DocumentData, DocumentReference } from '@firebase/firestore-types';

export const newPainLogLocationName = '+ Add New PainLogLocation';
export const emptyPainLogLocation: PainLogLocation = {created:new Date(),x:-1,y:-1,title:'',active:true,severity:-1};

const convertDocumentDataToPainLogLocation = (data: firebase.firestore.DocumentData): PainLogLocation => {
  const doc = data.data()
  const painLogLocationData: PainLogLocation = {
    key: data.id,
    created: doc.created && doc.created.seconds && new Date(doc.created.seconds * 1000),
    typeId: doc.typeId,
    x: doc.x,
    y: doc.y,
    title: doc.title,
    active: doc.active,
    description: doc.description,
    severity: doc.severity,
    medications: doc.medications
  }
  if (doc.created && doc.created.seconds) {
    painLogLocationData.created = new Date(doc.created.seconds * 1000)
  }
  return painLogLocationData
}

export const getPainLog = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firebase.firestore.setLogLevel('debug');
        dispatch(isFetching(true))
        firebase.firestore().collection('users')
          .doc(user.uid).collection('painLogLocations')
          .get()
          .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
            const painLogLocations: PainLogState['painlog'] = {};
            const arr = querySnapshot.docs.map(d => {
              const val = convertDocumentDataToPainLogLocation(d);
              return val
            })
            arr.forEach(d => { if (d.key) painLogLocations[d.key] = d })
            dispatch(GetPainLogAction(painLogLocations))
            dispatch(isFetching(false))
          })
          .finally(() => {
            //console.log('resolving getPainLog')
            resolve()
          })
      }
    })
  }
}

export const watchPainLog = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firestore.setLogLevel('debug');
        firebase.firestore()
          .collection('users')
          .doc(user.uid)
          .collection('painLogLocations')
          .orderBy('name')
          .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
            const painLogLocations: PainLogState['painlog'] = {};
            const arr = documentSnapshot.docs.map(d => {
              const val = convertDocumentDataToPainLogLocation(d);
              return val
            })
            arr.forEach(d => { if (d.key) painLogLocations[d.key] = d })
            dispatch(ReplacePainLogAction(painLogLocations));
          });
      }
    })
  }
}

export const addPainLogLocation = (painLogLocation: PainLogLocation, onComplete?: (PainLogLocation: PainLogLocation) => void): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        dispatch(isFetching(true))
        if (painLogLocation.key) {
          // its an update
          const { key, ...data } = painLogLocation;
          firebase.firestore().collection('users')
            .doc(user.uid).collection('painLogLocations')
            .doc(key).update(data)
            .then(() => {
              dispatch(isFetching(true))
              onComplete && onComplete(painLogLocation)
          })
        } else {
          // it's a new record
          painLogLocation.created = new Date(Date.now())
          firebase.firestore().collection('users')
            .doc(user.uid).collection('painLogLocations')
            .add(painLogLocation)
            .then((value: DocumentReference<DocumentData>) => {
              dispatch(isFetching(true))
              const data = {...painLogLocation, key: value.id}
              onComplete && onComplete(data)
            })
        }
      }
    })
  }
}
