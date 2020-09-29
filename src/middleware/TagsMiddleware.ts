import { State } from './../Types';
import { Tag, SetTagAction, GetTagsAction, TagsType } from '../reducers/TagsReducer';
import { Action } from './../reducers';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { DocumentData, DocumentReference } from '@firebase/firestore-types';
import { firebaseDocumentToArray } from '../firebase/utilities';

export const emptyTag: Tag = {name:''};

const convertDocumentDataToTag = (data: firebase.firestore.DocumentData): Tag => {
  const doc = data.data()
  const created = doc.created ? { by: doc.created.by, on: doc.created.on } : undefined
  return {
    key: data.id,
    name: doc.name,
    path: doc.path,
    created
  }
}

export const getTags = (prefixOrArray?: Array<string>): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const queryReference = firebase.firestore().collection('tags')
      let query: Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>>
      if (typeof prefixOrArray === 'string') {
        query = queryReference.where('name', '>=', prefixOrArray).get()
      } else {
        query = queryReference.where('id', 'in', prefixOrArray).get()
      }
      query.then((querySnapshot: firebase.firestore.QuerySnapshot) => {
        const tags: TagsType = {};
        const arr = querySnapshot.docs.map(d => {
          const val = convertDocumentDataToTag(d);
          return val
        })
        arr.forEach(d => { if (d.key) tags[d.key] = d })
        dispatch(GetTagsAction(tags))
      })
      .finally(() => {
        resolve()
      })
    })
  }
}

export const addTag = (tag: Tag, onComplete?: (tag: Tag) => void): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        if (tag.key) {
          // its an update
          const { key, ...data } = tag;
          firebase.firestore().collection('tags')
            .doc(key).update(data)
            .then(() => {
              onComplete && onComplete(tag)
          })
        } else {
          // it's a new record
          const newTag: Tag = {...tag, created: { by: user.uid, on: new Date() }}
          firebase.firestore().collection('tags')
            .add(newTag)
            .then((value: DocumentReference<DocumentData>) => {
              const data = {...newTag, key: value.id}
              onComplete && onComplete(data)
            })
        }
      }
    })
  }
}
