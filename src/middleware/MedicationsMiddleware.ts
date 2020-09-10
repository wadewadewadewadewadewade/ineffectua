import * as React from 'react';
import { State } from './../Types';
import { GetMedicationsAction, ReplaceMedicationsAction, MedicationsState } from '../reducers/MedicationsReducer';
import { Action, isFetching } from './../reducers';
import { Medication } from '../Types';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { DocumentData, DocumentReference } from '@firebase/firestore-types';

export const newMedicationName = '+ Add New Medication';
export const emptyMedication: Medication = {name:'',active:true};

export const medicationsToArray = (medication: MedicationsState['medications'], includeNewMedicationitem?: boolean) => {
  const medicationsArray = React.useMemo(() => {
    const arr = new Array<Medication>();
    if (medication) {
      const keys = Object.keys(medication);
      for(let i=0;i<keys.length;i++) {
        const dt = medication[keys[i]];
        dt.key = keys[i]
        arr.push(dt);
      }
    }
    if (includeNewMedicationitem) {
      arr.push({name:newMedicationName,active:true})
    }
    return arr;
  }, [medication])
  return medicationsArray
}

export const medicaitonIsValid = (medicaiton: Medication, Medications: MedicationsState['medications']): boolean => {
  const { name } = medicaiton;
  if (name && name.trim().length > 0) { // no null or empty names or colors
    if (name.trim() !== newMedicationName) { // no reserved names
      const preexistingMedicationsByname = medicationsToArray(Medications).filter(dt => dt.name = name.trim())
      if (preexistingMedicationsByname.length === 0) { // no duplicate names
        return true      
      }
    }
  }
  return false
}

const convertDocumentDataToMedication = (data: firebase.firestore.DocumentData): Medication => {
  const doc = data.data()
  const medicaitonData: Medication = {
    key: data.id,
    created: doc.created && doc.created.seconds && new Date(doc.created.seconds * 1000),
    typeId: doc.typeId,
    name: doc.name,
    active: doc.active,
    prescribed: doc.prescribed, // ContactID
    lastFilled: doc.lastFilled && doc.lastFilled.seconds && new Date(doc.lastFilled.seconds * 1000),
    refills: doc.refills,
    description: doc.description
  }
  if (doc.created && doc.created.seconds) {
    medicaitonData.created = new Date(doc.created.seconds * 1000)
  }
  return medicaitonData
}

export const getMedications = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firebase.firestore.setLogLevel('debug');
        dispatch(isFetching(true))
        firebase.firestore().collection('users')
          .doc(user.uid).collection('medications')
          .get()
          .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
            const medication: MedicationsState['medications'] = {};
            const arr = querySnapshot.docs.map(d => {
              const val = convertDocumentDataToMedication(d);
              return val
            })
            arr.forEach(d => { if (d.key) medication[d.key] = d })
            dispatch(GetMedicationsAction(medication))
            dispatch(isFetching(false))
          })
          .finally(() => {
            //console.log('resolving getMedications')
            resolve()
          })
      }
    })
  }
}

export const watchMedications = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firestore.setLogLevel('debug');
        firebase.firestore()
          .collection('users')
          .doc(user.uid)
          .collection('medications')
          .orderBy('name')
          .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
            const medications: MedicationsState['medications'] = {};
            const arr = documentSnapshot.docs.map(d => {
              const val = convertDocumentDataToMedication(d);
              return val
            })
            arr.forEach(d => { if (d.key) medications[d.key] = d })
            dispatch(ReplaceMedicationsAction(medications));
          });
      }
    })
  }
}

export const addMedication = (medicaiton: Medication, onComplete?: (Medication: Medication) => void): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        dispatch(isFetching(true))
        if (medicaiton.key) {
          // its an update
          const { key, ...data } = medicaiton;
          firebase.firestore().collection('users')
            .doc(user.uid).collection('medications')
            .doc(key).update(data)
            .then(() => {
              dispatch(isFetching(true))
              onComplete && onComplete(medicaiton)
          })
        } else {
          // it's a new record
          medicaiton.created = new Date(Date.now())
          firebase.firestore().collection('users')
            .doc(user.uid).collection('medications')
            .add(medicaiton)
            .then((value: DocumentReference<DocumentData>) => {
              dispatch(isFetching(true))
              const data = {...medicaiton, key: value.id}
              onComplete && onComplete(data)
            })
        }
      }
    })
  }
}
