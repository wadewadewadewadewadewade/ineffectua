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

type PainLogThread = {
  [isodate: string]: PainLogLocation
}

type PainLogKey = {
  thread: number,
  isodate: string,
  date: Date,
}

const unknownPainLogKey: PainLogKey = {
  thread: -1,
  isodate: new Date().toISOString(),
  date: new Date(),

}

type PainLogThreads = {
  beginnings: Array<string>,
  endings: Array<string>,
  oldest: PainLogKey,
  newest: PainLogKey,
  hash: {
    [thread: number]: PainLogThread
  }
}

const initialPainLogThreads: PainLogThreads = {
  beginnings:[],
  endings:[],
  oldest: unknownPainLogKey,
  newest: unknownPainLogKey,
  hash:{}
}

const PainLogHistory = (painlog: PainLogType) => React.useMemo(() => {
  const painlogThreads: PainLogThreads = initialPainLogThreads
  const painlogArray = firebaseDocumentToArray(painlog)
      
  const copyPortionOfLocation = (loc:PainLogLocation): PainLogLocation => {
    const { key, created, previous, next, ...rest } = loc
    return rest
  }

  const crawlThread = (
    pl: PainLogType,
    threads: PainLogThreads,
    current: PainLogLocation,
    thread: number,
    previousKey?: PainLogKey
  ) => {
    if (current.created) {
      const isodate = current.created.toISOString()
      if (previousKey) {
        Object.assign<PainLogLocation, PainLogLocation[]>(threads.hash[thread][isodate], [
          threads.hash[previousKey.thread][previousKey.isodate],
          copyPortionOfLocation(current)
        ])
      } else {
        threads.hash[thread][isodate] = copyPortionOfLocation(current)
      }
      const newKey: PainLogKey = {thread, isodate, date: current.created}
      if (current.next) {
        crawlThread(pl, threads, pl[current.next], thread, newKey)
      } else {
        threads.endings[thread] = isodate
        if (threads.newest.date < current.created) {
          threads.newest = newKey
        }
      }
    }
  }
  
  // filter the list of locations so it's just the thread begninnings,
  // and sort so the oldes location is first to se the 'oldest' property
  const arr = painlogArray.filter(p => p.previous === undefined).sort((a,b) => {
    if (!a.created || !b.created) {
      return -1
    } else if (a.created < b.created) {
      return -1
    } else {
      return 1
    }
  })
  for(let i=0;i<arr.length;i++) {
    const current = arr[i]
    if (current.created) {
      const isodate = current.created.toISOString()
      if (painlogThreads.oldest === unknownPainLogKey) {
        painlogThreads.oldest = {
          thread: i,
          isodate,
          date: current.created
        }
      }
      painlogThreads.beginnings[i] = isodate
      crawlThread(painlog, painlogThreads, current, i)
    }
  }


  return painlogThreads

}, [painlog])

export const getPainLogArrayByRange = (painlog: PainLogType, start: Date, end: Date): Array<PainLogLocation> => {
  const result = new Array<PainLogLocation>()
  const threadsToDiscard = new Array<number>()
  const history = PainLogHistory(painlog)
  
  // if thread ends before window, or thread ending is inactive within window, remove it
  for(let thread=0;thread<history.endings.length;thread++) {
    const isodate = history.endings[thread]
    const current = history.hash[thread][isodate]
    if (!current.created || current.created < start || !history.hash[thread][isodate].active) {
      threadsToDiscard.push(thread)
    }
  }

  // if thread starts after the window, remove it also
  for(let thread=0;thread<history.beginnings.length;thread++) {
    const isodate = history.beginnings[thread]
    const current = history.hash[thread][isodate]
    if (!current.created || current.created > end) {
      threadsToDiscard.push(thread)
    }
  }

  // now that we know which thrads to ignore, find newest keys that are still active within window
  const getNewestPainLogLocationWithinRangeByThread = (thread: PainLogThread) => {
    const isodates = Object.keys(thread).sort()
    const startString = start.toISOString()
    let threadNumber = 0
    let isodate = isodates[threadNumber]
    let nextIsodate = isodates[threadNumber + 1]
    while (nextIsodate && nextIsodate < startString) {
      threadNumber++
      isodate = nextIsodate
      nextIsodate = isodates[threadNumber + 1]
    }
    return isodate
  }
  for(let thread=0;thread<history.beginnings.length;thread++) {
    if (threadsToDiscard.indexOf(thread) < 0) {
      const isodate = getNewestPainLogLocationWithinRangeByThread(history.hash[thread])
      result.push(history.hash[thread][isodate])
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
