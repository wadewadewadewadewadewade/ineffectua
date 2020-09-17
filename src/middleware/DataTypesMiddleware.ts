import { State } from './../Types';
import { DataType, GetDataTypesAction, ReplaceDataTypesAction, DataTypesType } from '../reducers/DataTypesReducer';
import { Action } from './../reducers';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { DocumentData, DocumentReference } from '@firebase/firestore-types';
import { firebaseDocumentToArray } from '../firebase/utilities';

export const newTypeTitle = '+ Add New Type';
export const defaultTypeTitle = 'Default';
export const defaultColor = '#660000';
export const emptyDataType: DataType = {title:'',color:'#000'};

// START contreacting color borrowed from https://medium.com/better-programming/generate-contrasting-text-for-your-random-background-color-ac302dc87b4
interface RGB {
  b: number;
  g: number;
  r: number;
}

function rgbToYIQ({ r, g, b }: RGB): number {
  return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}

function hexToRgb(hex: string): RGB | undefined {
  if (!hex || hex === undefined || hex === '') {
      return undefined;
  }

  const result: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : undefined;
}

export function contrast(colorHex: string | undefined, threshold: number = 128): string {
  if (colorHex === undefined) {
      return '#000';
  }

  const rgb: RGB | undefined = hexToRgb(colorHex);

  if (rgb === undefined) {
      return '#000';
  }

  return rgbToYIQ(rgb) >= threshold ? '#000' : '#fff';
}
// END contrasting text calculation

export const dataTypeIsValid = (datatype: DataType, datatypes: DataTypesType): boolean => {
  const { title, color } = datatype;
  if (title && title.trim().length > 0 && color && color.trim().length > 0) { // no null or empty titles or colors
    if (title.trim() !== newTypeTitle && title.trim() !== defaultTypeTitle) { // no reserved titles
      const preexistingDataTypesByTitle = firebaseDocumentToArray(datatypes).filter((dt: DataType) => dt.title = title.trim())
      if (preexistingDataTypesByTitle.length === 0) { // no duplicate titles
        return true      
      }
    }
  }
  return false
}

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
        firebase.firestore().collection('users')
          .doc(user.uid).collection('datatypes')
          .get()
          .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
            const datatypes: DataTypesType = {};
            const arr = querySnapshot.docs.map(d => {
              const val = convertDocumentDataToDataType(d);
              return val
            })
            arr.forEach(d => { if (d.key) datatypes[d.key] = d })
            dispatch(GetDataTypesAction(datatypes))
          })
          .finally(() => {
            //console.log('resolving getDataTypes')
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
          .collection('datatypes')
          .orderBy('window.starts')
          .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
            const datatypes: DataTypesType = {};
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
        if (dataType.key) {
          // its an update
          const { key, ...data } = dataType;
          firebase.firestore().collection('users')
            .doc(user.uid).collection('datatypes')
            .doc(key).update(data)
            .then(() => {
              onComplete && onComplete(dataType)
          })
        } else {
          // it's a new record
          firebase.firestore().collection('users')
            .doc(user.uid).collection('datatypes')
            .add(dataType)
            .then((value: DocumentReference<DocumentData>) => {
              const data = {...dataType, key: value.id}
              onComplete && onComplete(data)
            })
        }
      }
    })
  }
}
