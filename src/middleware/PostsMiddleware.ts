import * as React from 'react';
import { State } from './../Types';
import { Post, initialCriteria, PostsState, PostCriteria, ReplacePostsAction, PostsType } from '../reducers/PostsReducer';
import { Action } from './../reducers';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { NetworkInfo } from "react-native-network-info";
// for the add call when it doesn't go through redux/thunk
import { firebase as firebaseInstance } from '../firebase/config';
import { AuthState } from '../reducers/AuthReducer';
import { useSelector } from 'react-redux';
import { TypedQueryFunction } from 'react-query';

export const emptyPost: Post = {
  body: '',
  tags: [],
  criteria: initialCriteria,
  created: {
    by: 'unknown',
    on: new Date('1970-01-01'),
  }
}

const convertDocumentDataToPost = (data: firebase.firestore.DocumentData): Post => {
  const doc = data.data()
  const postData: Post = {
    key: data.id,
    body: doc.body,
    tags: doc.tags,
    criteria: doc.criteria,
    created: {
      by: doc.created.by,
      on: new Date(doc.created.on.seconds * 1000),
    }
  }
  return postData
}

type FetchObject = {
  body: string,
  tags: Array<string>,
  criteria: PostCriteria,
  created: {
    by: string,
    on: string,
  }
}

const mapFetchToPosts = (fetchObject: Array<FetchObject>): Array<Post> => {
  const posts = new Array<Post>()
  if (fetchObject && fetchObject.length > 0) {
    fetchObject.forEach(po => {
      const { created, ...rest } = po
      const post: Post = {...rest, created: { by: created.by, on: new Date(created.on) }}
      posts.push(post)
    })
  }
  return posts
}

export const fetchPosts = async (user: firebase.User | false, key: PostCriteria, cursor = 0): Promise<Array<Post>> => {
  if (!user) {
    return new Promise<Array<Post>>(r => r([]))
  } else {
    return user.getIdToken().then(token => fetch('https://us-central1-ineffectua.cloudfunctions.net/posts/' + cursor, {
      headers: new Headers({
        'Authorization': 'Bearer ' + token
      })
    })
    .then(promise => promise.json().then(posts => mapFetchToPosts(posts))))
  }
}

export type PostsObserver = (posts: PostsType) => void

export class PostsSubject {
  private observers: Array<PostsObserver> = []
  private unsubscribe: () => void

  constructor(user: AuthState['user'], criteria: PostCriteria, firebase = firebaseInstance) {
    if (user) {
      //firestore.setLogLevel('debug');
      this.unsubscribe = firebase.firestore()
        .collection('posts')
        .orderBy('created.on', 'desc')
        .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
          const posts: PostsState['posts'] = {
            items: [],
            criteria
          };
          posts.items = documentSnapshot.docs.map(d => {
            const val = convertDocumentDataToPost(d);
            return val
          })
          this.notify(posts)
        });
    } else {
      this.unsubscribe = () => {
        console.warn('Unsubscribing PostsSubject that was never subscribed', {criteria})
      }
    }
  }

  public destroy() {
    this.unsubscribe()
  }

  public attach(observer: PostsObserver) {
    this.observers.push(observer)
  }

  public detach(observer: PostsObserver) {
    this.observers = this.observers.filter(o => observer !== o)
  }

  public notify(posts: PostsType) {
    this.observers.forEach(o => o(posts))
  }

}

export const watchPosts = (criteria: PostCriteria): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firestore.setLogLevel('debug');
        firebase.firestore()
          .collection('posts')
          .orderBy('created.on')
          .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
            const posts: PostsState['posts'] = {
              items: [],
              criteria
            };
            posts.items = documentSnapshot.docs.map(d => {
              const val = convertDocumentDataToPost(d);
              return val
            })
            dispatch(ReplacePostsAction(posts));
          });
      }
    })
  }
}

export const addPost = (user: AuthState['user'], post: Post, firebase = firebaseInstance) => {
  return new Promise<Post>((resolve, reject) => {
    if (user) {
      if (post.key) {
        // its an update
        const { key, ...data } = post
        firebase.firestore().collection('posts')
          .doc(key).update(data)
          .then(() => resolve(post))
          .catch(reject)
      } else {
        // it's a new record
        const createNewRecord = (ipv4Address: string | null) => {
          return new Promise<Post>((res, rej) => {
            const from: string | undefined = ipv4Address !== null ? ipv4Address : undefined
            const created: Post['created'] = {
              by: user.uid,
              on: new Date(),
            }
            if (from !== undefined) {
              created.from = from
            }
            const newPost: Post = {...post, created}
            firebase.firestore().collection('posts')
              .add(newPost)
              .then((value: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>) => {
                const data = {...newPost, key: value.id}
                res(data)
              })
              .catch(rej)
          })
        }
        /* I'm using NetworkInfo so i can try to put the IP of the client into Firebase for locale-searching
           down-the-road, because Firebase Functions require met to enter my payment info again */
        const createnewRecordWithIP = () => {
          return NetworkInfo.getIPV4Address().then(ipv4Address => {
            return createNewRecord(ipv4Address)
          }).catch(err => {
            return createNewRecord(null)
          })
        }
        createnewRecordWithIP().then(resolve).catch(reject)
      }
    }
  })
}

export const addPostWithDispatch = (tag: Post): ThunkAction<Promise<Post>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<Post> => {
    return new Promise<Post>((resolve, reject) => {
      const { user } = getState();
      if (user) {
        addPost(user, tag).then(resolve).catch(reject)
      } else {
        reject('Please authenticate')
      }
    })
  }
}
