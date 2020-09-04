import { State } from './../Types';
import { GetDataTypesAction, ReplaceDataTypesAction, DataTypesState } from '../reducers/DataTypesReducer';
import { Action, isFetching } from './../reducers';
import { DataType } from '../Types';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { DocumentData, DocumentReference } from '@firebase/firestore-types';

const convertDocumentDataToDataType = (data: firebase.firestore.DocumentData): DataType => {
  const doc = data.data()
  return {
    key: data.id,
    title: doc.title,
    color: doc.color
  }
}

export const getDataTypes = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firebase.firestore.setLogLevel('debug');
        dispatch(isFetching(true))
        firebase.firestore().collection('users')
          .doc(user.uid).collection('datatypes')
          .get()
          .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
            const datatypes: DataTypesState['datatypes'] = {};
            const arr = querySnapshot.docs.map(d => {
              const val = convertDocumentDataToDataType(d);
              return val
            })
            arr.forEach(d => { if (d.key) datatypes[d.key] = d })
            dispatch(GetDataTypesAction(datatypes))
            dispatch(isFetching(false))
            resolve()
          })
      }
    })
  }
}

export const watchDataTypes = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firestore.setLogLevel('debug');
        firebase.firestore()
          .collection('users')
          .doc(user.uid)
          .collection('calendar')
          .orderBy('window.starts')
          .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
            const datatypes: DataTypesState['datatypes'] = {};
            const arr = documentSnapshot.docs.map(d => {
              const val = convertDocumentDataToDataType(d);
              return val
            })
            arr.forEach(d => { if (d.key) datatypes[d.key] = d })
            dispatch(ReplaceDataTypesAction(datatypes));
          });
      }
    })
  }
}

export const addDataType = (dataType: DataType, onComplete?: (datatype: DataType) => void): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        dispatch(isFetching(true))
        if (dataType.key) {
          // its an update
          const { key, ...data } = dataType;
          firebase.firestore().collection('users')
            .doc(user.uid).collection('datatypes')
            .doc(key).update(data)
            .then(() => {
              dispatch(isFetching(true))
              onComplete && onComplete(dataType)
          })
        } else {
          // it's a new record
          firebase.firestore().collection('users')
            .doc(user.uid).collection('datatypes')
            .add(dataType)
            .then((value: DocumentReference<DocumentData>) => {
              dispatch(isFetching(true))
              const data = {...dataType, key: value.id}
              onComplete && onComplete(data)
            })
        }
      }
    })
  }
}
