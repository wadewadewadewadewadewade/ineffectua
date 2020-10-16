import {State} from './../Types';
import {Tag, UserTag} from '../reducers/TagsReducer';
import {Action} from './../reducers';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
// for the autocomplete call, as it doesn't go through redux/thunk
import {firebase as firebaseInstance} from '../firebase/config';
import {AuthState} from '../reducers/AuthReducer';

export const emptyTag: Tag = {name: ''};

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

type FetchObject = {
  key: string;
  name: string;
  path: string;
};

const mapFetchToTags = (fetchObject: Array<FetchObject>): Array<Tag> => {
  const posts = new Array<Tag>();
  if (fetchObject && fetchObject.length > 0) {
    fetchObject.forEach((po) => {
      posts.push(po);
    });
  }
  return posts;
};

export const getTagsForAutocomplete = (
  prefix: string,
  tagsInUse: Array<string>,
  minimumCharacters = 3,
): Promise<Array<Tag>> => {
  if (!prefix || prefix.length < minimumCharacters) {
    return new Promise<Array<Tag>>((r) => r([]));
  } else {
    const tagsInUseJson =
      tagsInUse && tagsInUse.length > 0 ? JSON.stringify(tagsInUse) : '[]';
    return fetch(
      `https://us-central1-ineffectua.cloudfunctions.net/api/v1/tags/${prefix}/${tagsInUseJson}`,
    ).then((promise) => promise.json().then((tags) => mapFetchToTags(tags)));
  }
};

export const getTagsByKeyArray = (
  tagIds: Array<string>,
): Promise<Array<Tag>> => {
  if (!tagIds || tagIds.length < 1) {
    return new Promise<Array<Tag>>((r) => r([]));
  } else {
    const tagsInUseJson = JSON.stringify(tagIds);
    return fetch(
      `https://us-central1-ineffectua.cloudfunctions.net/api/v1/tags/${tagsInUseJson}`,
    ).then((promise) => promise.json().then((tags) => mapFetchToTags(tags)));
  }
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

export const addTag = (user: AuthState['user'], tag: Tag) => {
  if (!user) {
    return new Promise<string>((re, rj) => rj('not authenticated'));
  } else if (user.getIdToken) {
    return user.getIdToken().then(async (token) =>
      (
        await fetch(
          'https://us-central1-ineffectua.cloudfunctions.net/api/v1/tags',
          {
            method: 'PUT',
            headers: new Headers({
              Authorization: 'Bearer ' + token,
              ContentType: 'application/json',
            }),
            body: JSON.stringify(tag),
          },
        )
      ).json(),
    );
  } else {
    return new Promise<string>((re, rj) => rj('unknown authentication error'));
  }
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
