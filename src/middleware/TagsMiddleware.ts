import {Tag, UserTag} from '../reducers/TagsReducer';
import {User} from '../reducers/AuthReducer';
import {getFirebaseDataWithUser, setFirebaseDataWithUser} from './Utilities';

export const emptyTag: Tag = {key: '', name: '', path: ''};

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

export const getTagIdByPath = async (path: string): Promise<string> => {
  return await fetch(
    `https://us-central1-ineffectua.cloudfunctions.net/api/v1/tags/-/${path}`,
  ).then((promise) => promise.json());
};

export const getTagsForAutocomplete = (
  prefix: string,
  tagsInUse: Array<string>,
  minimumCharacters = 3,
): Promise<Array<Tag>> => {
  if (!prefix || prefix.length < minimumCharacters || prefix === '-') {
    // '-' is used for get-tag-path api endpoint
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

export const getTagsForUser = (user: User, userId: string, cursor = 0) => {
  if (!user) {
    return new Promise<Array<UserTag>>((resolve) =>
      resolve(new Array<UserTag>()),
    );
  } else {
    return getFirebaseDataWithUser<Array<UserTag>>(
      user,
      `users/${userId}/tags`,
      cursor,
    );
  }
};

export const addTagForUser = (user: User, tag: UserTag) => {
  if (!user) {
    return new Promise<UserTag>((resolve) => resolve({} as UserTag));
  } else {
    return setFirebaseDataWithUser<UserTag>(user, 'users/tags', tag);
  }
};

export const deleteTagForUser = (user: User, tag: UserTag) => {
  if (!user) {
    return new Promise<UserTag>((resolve) => resolve({} as UserTag));
  } else {
    return setFirebaseDataWithUser<UserTag>(user, 'users/tags', tag, 'DELETE');
  }
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

export const addTag = (user: User, tag: Tag) => {
  return setFirebaseDataWithUser<Tag>(user, 'tags', tag);
};
