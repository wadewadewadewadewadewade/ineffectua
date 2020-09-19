import * as React from 'react';
import { State } from './../Types';
import { GetPainLogAction, ReplacePainLogAction, PainLogState, PainLogType } from '../reducers/PainLogReducer';
import { Action } from './../reducers';
import { PainLogLocation } from './../reducers/PainLogReducer';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { DocumentData, DocumentReference } from '@firebase/firestore-types';
import { firebaseDocumentToArray } from '../firebase/utilities';

export const newPainLogLocationName = '+ Add New PainLogLocation';
export const emptyPainLogLocation: PainLogLocation = {created:new Date()};

type PainLogThreads = {
  beginnings: Array<string>,
  endings: Array<string>,
  hash: { [key: string]: PainLogLocation }
}

const buildPainLogHistory = (painlog: PainLogType) => React.useMemo(() => {
  const painlogThreads: PainLogThreads = {beginnings:[],endings:[],hash:{}}
  const painlogArray = firebaseDocumentToArray(painlog)
      
  const copyPortionOfLocation = (loc:PainLogLocation): PainLogLocation => {
    const { key, created, previous, next, ...rest } = loc
    return rest
  }

  const generateKey = (loc: PainLogLocation, index: number) => loc.created?.toISOString() + '_' + index

  const crawlThread = (
    pl: PainLogType,
    threads: PainLogThreads,
    current: PainLogLocation,
    index: number,
    previousKey?: string
  ) => {
    if (current.created) {
      const newKey = generateKey(current, index)
      if (previousKey) {
        Object.assign<PainLogLocation, PainLogLocation[]>(threads.hash[newKey], [
          threads.hash[previousKey],
          copyPortionOfLocation(current)
        ])
      } else {
        threads.hash[newKey] = copyPortionOfLocation(current)
      }
      if (current.next) {
        crawlThread(pl, threads, pl[current.next], index, newKey)
      } else {
        threads.endings[index] = newKey
      }
    }
  }
  
  const arr = painlogArray.filter(p => p.previous === undefined)
  for(let i=0;i<arr.length;i++) {
    painlogThreads.beginnings[i] = generateKey(arr[i], i)
    crawlThread(painlog, painlogThreads, arr[i], i)
  }
  return painlogThreads

}, [painlog])

export const getPainLogArrayByRange = (painlog: PainLogType, start: Date, end: Date): Array<PainLogLocation> => {
  const result = new Array<PainLogLocation>()
  const threadsToDiscard = new Array<number>()
  const history = buildPainLogHistory(painlog)
  
  // if thread ends before window, or thread is inactive within window, remove it
  for(let i=0;i<history.endings.length;i++) {
    const ended = history.endings[i]
    const [ dateString, indexString ] = ended.split('_')
    if (new Date(dateString) < start || !history.hash[ended].active) {
      threadsToDiscard.push(parseInt(indexString, 10))
    }
  }

  // if thread starts after the window, remove it also
  for(let i=0;i<history.beginnings.length;i++) {
    const started = history.beginnings[i]
    const [ dateString, indexString ] = started.split('_')
    if (new Date(dateString) > end) {
      threadsToDiscard.push(parseInt(indexString, 10))
    }
  }

  // new that we know which thrads to ignore, find newest keys that are still active within window
  for(let i=0;i<history.endings.length;i++) {
    if (threadsToDiscard.indexOf(i) < 0) {
      result.push(history.hash[history.endings[i]])
    }
  }

  // return what's left
  return result
}


const convertDocumentDataToPainLogLocation = (data: firebase.firestore.DocumentData): PainLogLocation => {
  const doc = data.data()
  const painLogLocationData: PainLogLocation = {
    key: data.id,
    created: doc.created && doc.created.seconds && new Date(doc.created.seconds * 1000),
    typeId: doc.typeId,
    title: doc.title,
    active: doc.active,
    description: doc.description,
    severity: doc.severity,
    medications: doc.medications,
    next: doc.next,
    previous: doc.previous,
  }
  if (doc.position) {
    painLogLocationData.position = doc.position
  }
  return painLogLocationData
}

export const getPainLog = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        firebase.firestore().collection('users')
          .doc(user.uid).collection('painlog')
          .get()
          .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
            const painLogLocations: PainLogState['painlog'] = {};
            const arr = querySnapshot.docs.map(d => {
              const val = convertDocumentDataToPainLogLocation(d);
              return val
            })
            arr.forEach(d => { if (d.key) painLogLocations[d.key] = d })
            dispatch(GetPainLogAction(painLogLocations))
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
          .collection('painlog')
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
        if (painLogLocation.key) {
          // its an update
          const { key, ...data } = painLogLocation;
          firebase.firestore().collection('users')
            .doc(user.uid).collection('painlog')
            .doc(key).update(data)
            .then(() => {
              onComplete && onComplete(painLogLocation)
          })
        } else if (painLogLocation.previous) {
          // it's a change to a previous location = new record in linked-list
          painLogLocation.created = new Date(Date.now())
          firebase.firestore().collection('users')
            .doc(user.uid).collection('painlog')
            .add(painLogLocation)
            .then((value: DocumentReference<DocumentData>) => {
              const data = {...painLogLocation, key: value.id}
              // then update the "parent" record witht eh "child" id
              firebase.firestore().collection('users')
                .doc(user.uid).collection('painlog')
                .doc(painLogLocation.previous).update({next: data.key})
              onComplete && onComplete(data)
            })
        } else {
          // it's a new record
          painLogLocation.created = new Date(Date.now())
          firebase.firestore().collection('users')
            .doc(user.uid).collection('painlog')
            .add(painLogLocation)
            .then((value: DocumentReference<DocumentData>) => {
              const data = {...painLogLocation, key: value.id}
              onComplete && onComplete(data)
            })
        }
      }
    })
  }
}
