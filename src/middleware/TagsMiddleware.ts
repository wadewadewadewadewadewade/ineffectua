import {State} from './../Types';
import {Tag, UserTag} from '../reducers/TagsReducer';
import {Action} from './../reducers';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {NetworkInfo} from 'react-native-network-info';
// for the autocomplete call, as it doesn't go through redux/thunk
import {firebase as firebaseInstance} from '../firebase/config';
import {AuthState} from '../reducers/AuthReducer';

export const emptyTag: Tag = {name: ''};

const convertDocumentDataToTag = (
  data: firebase.firestore.DocumentData,
): Tag => {
  const doc = data.data();
  return {
    key: data.id,
    name: doc.name,
    path: doc.path,
    // don't add in create or searchableIndex, as that's just for server-side stuff
  };
};

const convertDocumentDataToUserTag = (
  data: firebase.firestore.DocumentData,
): UserTag => {
  const doc = data.data();
  return {
    key: data.id,
    name: doc.name,
    tagId: doc.tagId,
  };
};

export const getTagsForAutocomplete = (
  prefix?: string,
  tagsInUse?: Array<Tag>,
  limit = 5,
  minimumCharacters = 3,
  firebase = firebaseInstance,
) => {
  return new Promise<Array<Tag>>((resolve, reject) => {
    if (!prefix || prefix.length < minimumCharacters) {
      resolve(new Array<Tag>());
    } else if (tagsInUse && tagsInUse.length > 0) {
      const tagIds = tagsInUse.map((t) => t.key);
      firebase
        .firestore()
        .collection('tags')
        .where('name', '>=', prefix)
        .where(firebase.firestore.FieldPath.documentId(), 'not-in', tagIds)
        .limit(limit)
        .get()
        .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
          const arr = querySnapshot.docs.map((d) => {
            const val = convertDocumentDataToTag(d);
            return val;
          });
          resolve(arr);
        })
        .catch((err: Error) => reject(err));
    } else {
      firebase
        .firestore()
        .collection('tags')
        .where('name', '>=', prefix)
        .limit(limit)
        .get()
        .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
          const arr = querySnapshot.docs.map((d) => {
            const val = convertDocumentDataToTag(d);
            return val;
          });
          resolve(arr);
        })
        .catch((err) => reject(err));
    }
  });
};

export const getTagsByKeyArray = (
  tagIdsJsonString: string | undefined,
  firebase = firebaseInstance,
) => {
  return new Promise<Array<Tag>>((resolve, reject) => {
    if (!tagIdsJsonString || tagIdsJsonString === '[]') {
      setTimeout(() => {
        const arr = new Array<Tag>();
        resolve(arr);
      }, 1000);
    } else {
      const tagIds = JSON.parse(tagIdsJsonString);
      firebase
        .firestore()
        .collection('tags')
        .where(firebase.firestore.FieldPath.documentId(), 'in', tagIds)
        .get()
        .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
          const arr = querySnapshot.docs.map((d) => {
            const val = convertDocumentDataToTag(d);
            return val;
          });
          resolve(arr);
        })
        .catch((e) => reject(e));
    }
  });
};

export const getTagIdsForUser = (
  userId?: string,
  firebase = firebaseInstance,
) => {
  return new Promise<Array<string>>((resolve, reject) => {
    if (!userId) {
      resolve(new Array<string>());
    } else {
      firebase
        .firestore()
        .collection('users')
        .doc(userId)
        .collection('tags')
        .get()
        .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
          const userTags = querySnapshot.docs.map((tagIdDoc) =>
            convertDocumentDataToUserTag(tagIdDoc),
          );
          const userTagIds = userTags.map((ut) => ut.tagId);
          resolve(userTagIds);
          return userTagIds;
        });
    }
  });
};

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

export const addTag = (
  user: AuthState['user'],
  tag: Tag,
  firebase = firebaseInstance,
) => {
  return new Promise<Tag>((resolve, reject) => {
    if (user) {
      if (tag.key) {
        // its an update
        /*const { key, searchableIndex, ...data } = tag
        tag.searchableIndex = createIndex(tag.name)*/
        const {key, ...data} = tag;
        firebase
          .firestore()
          .collection('tags')
          .doc(key)
          .update(data)
          .then(() => resolve(tag))
          .catch(reject);
      } else {
        // it's a new record
        const createNewRecord = (ipv4Address: string | null) => {
          return new Promise<Tag>((res, rej) => {
            const from: string | undefined =
              ipv4Address !== null ? ipv4Address : undefined;
            const created: Tag['created'] = {
              by: user.uid,
              on: new Date(),
            };
            if (from !== undefined) {
              created.from = from;
            }
            const path = tag.name.replace(/([\s]+)/g, '-');
            /*const searchableIndex: Tag['searchableIndex'] = createIndex(tag.name)
            const newTag: Tag = {...tag, created, searchableIndex}*/
            const newTag: Tag = {...tag, created, path};
            firebase
              .firestore()
              .collection('tags')
              .add(newTag)
              .then(
                (
                  value: firebase.firestore.DocumentReference<
                    firebase.firestore.DocumentData
                  >,
                ) => {
                  const data = {...newTag, key: value.id};
                  res(data);
                },
              )
              .catch(rej);
          });
        };
        /* I'm using NetworkInfo so i can try to put the IP of the client into Firebase for locale-searching
           down-the-road, because Firebase Functions require met to enter my payment info again */
        const createnewRecordWithIP = () => {
          return NetworkInfo.getIPV4Address()
            .then((ipv4Address) => {
              return createNewRecord(ipv4Address);
            })
            .catch((err) => {
              console.info("Can't get IP for tag geolocation", err);
              return createNewRecord(null);
            });
        };
        getTagsForAutocomplete(tag.name, [], 5, 3, firebase).then((ta) => {
          // first check that the tag isn't alread in the DB to avoid duplicates
          if (ta[0].name.toLowerCase() === tag.name.toLowerCase()) {
            resolve(ta[0]);
          } else {
            createnewRecordWithIP().then(resolve).catch(reject);
          }
        });
      }
    }
  });
};

export const addTagWithDispatch = (
  tag: Tag,
  onComplete?: (tag: Tag) => void,
): ThunkAction<Promise<Tag>, State, firebase.app.App, Action> => {
  return (
    dispatch: ThunkDispatch<State, {}, Action>,
    getState: () => State,
    firebase: firebase.app.App,
  ): Promise<Tag> => {
    return new Promise<Tag>((resolve, reject) => {
      const {user} = getState();
      if (user) {
        if (onComplete !== undefined) {
          addTag(user, tag)
            .then((t) => {
              resolve(t);
              return t;
            })
            .then(onComplete)
            .catch(reject);
        } else {
          addTag(user, tag).then(resolve).catch(reject);
        }
      } else {
        reject('Please authenticate');
      }
    });
  };
};
