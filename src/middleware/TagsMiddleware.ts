import { State } from './../Types';
import { Tag, GetTagsAction, TagsType } from '../reducers/TagsReducer';
import { Action } from './../reducers';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { NetworkInfo } from "react-native-network-info";

export const emptyTag: Tag = {name:''};

const convertDocumentDataToTag = (data: firebase.firestore.DocumentData): Tag => {
  const doc = data.data()
  return {
    key: data.id,
    name: doc.name,
    path: doc.path,
    // don't add in create or searchableIndex, as that's just for server-side stuff
  }
}

export const getTags = (prefixOrArray?: Array<string>): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const queryReference = firebase.firestore().collection('tags')
      let query: Promise<firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>> | undefined = undefined
      if (!prefixOrArray) {
        resolve()
      } else if (prefixOrArray.length === 1) {
        const prefix = prefixOrArray[0]
        query = queryReference.where('name', '>=', prefix).get()
      } else {
        query = queryReference.where('id', 'in', prefixOrArray).get()
      }
      if (query !== undefined) {
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
      }
    })
  }
}

/*function createIndex(text: string): Tag['searchableIndex'] {
  const arr = text.toLowerCase().split('');
  const searchableIndex: Tag['searchableIndex'] = {};
  let previousKey = '';
  for (const char in arr) {
    const key = previousKey + char;
    searchableIndex[key] = true;
    previousKey = key;
  }
  return searchableIndex;
}*/

export const addTag = (tag: Tag, onComplete?: (tag: Tag) => void): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        if (tag.key) {
          // its an update
          /*const { key, searchableIndex, ...data } = tag
          tag.searchableIndex = createIndex(tag.name)*/
          const { key, ...data } = tag
          firebase.firestore().collection('tags')
            .doc(key).update(data)
            .then(() => {
              onComplete && onComplete(tag)
          })
        } else {
          // it's a new record
          const createNewRecord = (ipv4Address: string | null) => {
            const from: string | undefined = ipv4Address !== null ? ipv4Address : undefined
            const created: Tag['created'] = {
              by: user.uid,
              on: new Date(),
            }
            if (from !== undefined) {
              created.from = from
            }
            const path = tag.name.replace(/([\s]+)/g,'-')
            /*const searchableIndex: Tag['searchableIndex'] = createIndex(tag.name)
            const newTag: Tag = {...tag, created, searchableIndex}*/
            const newTag: Tag = {...tag, created, path}
            firebase.firestore().collection('tags')
              .add(newTag)
              .then((value: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>) => {
                const data = {...newTag, key: value.id}
                onComplete && onComplete(data)
              })
          }
          /* I'm using NetworkInfo so i can try to put the IP of the client into Firebase for locale-searching
             down-the-road, because Firebase Functions require met to enter my payment info again */
          NetworkInfo.getIPV4Address().then(ipv4Address => {
            createNewRecord(ipv4Address)
          }).catch(err => {
            createNewRecord(null)
          })
        }
      }
    })
  }
}
