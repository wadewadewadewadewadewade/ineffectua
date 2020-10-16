import {State} from './../Types';
import {
  Post,
  initialCriteria,
  PostsState,
  PostCriteria,
  ReplacePostsAction,
  PostsType,
} from '../reducers/PostsReducer';
import {Action} from './../reducers';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';
// for the add call when it doesn't go through redux/thunk
import {firebase as firebaseInstance} from '../firebase/config';
import {AuthState, User} from '../reducers/AuthReducer';

export const emptyPost: Post = {
  key: '',
  body: '',
  tags: [],
  criteria: initialCriteria,
  created: {
    by: 'unknown',
    on: new Date('1970-01-01'),
  },
};

const convertDocumentDataToPost = (
  data: firebase.firestore.DocumentData,
): Post => {
  const doc = data.data();
  const postData: Post = {
    key: data.id,
    body: doc.body,
    tags: doc.tags,
    criteria: doc.criteria,
    created: {
      by: doc.created.by,
      on: new Date(doc.created.on.seconds * 1000),
    },
  };
  return postData;
};

type FetchObject = {
  key: string;
  body: string;
  tags: Array<string>;
  criteria: PostCriteria;
  created: {
    by: string;
    on: string;
  };
};

const mapFetchToPosts = (fetchObject: Array<FetchObject>): Array<Post> => {
  const posts = new Array<Post>();
  if (fetchObject && fetchObject.length > 0) {
    fetchObject.forEach((po) => {
      const {created, ...rest} = po;
      const post: Post = {
        ...rest,
        created: {by: created.by, on: new Date(created.on)},
      };
      posts.push(post);
    });
  }
  return posts;
};

export const fetchPosts = async (
  user: User | false,
  key: string,
  cursor = 0,
): Promise<Array<Post>> => {
  if (!user) {
    return new Promise<Array<Post>>((r) => r([]));
  } else {
    if (user.getIdToken) {
      const criteria: PostCriteria = JSON.parse(key);
      const path = criteria.key
        ? `${criteria.key.type}/${criteria.key.id}`
        : 'posts';
      return user.getIdToken().then((token) =>
        fetch(
          `https://us-central1-ineffectua.cloudfunctions.net/api/v1/${path}/${cursor}`,
          {
            headers: new Headers({
              Authorization: 'Bearer ' + token,
            }),
          },
        ).then((promise) =>
          promise.json().then((posts) => mapFetchToPosts(posts)),
        ),
      );
    } else {
      return new Promise<Array<Post>>((r) => []);
    }
  }
};

export type PostsObserver = (posts: PostsType) => void;

export class PostsSubject {
  private observers: Array<PostsObserver> = [];
  private unsubscribe: () => void;

  constructor(
    user: AuthState['user'],
    criteria: PostCriteria,
    firebase = firebaseInstance,
  ) {
    if (user) {
      //firestore.setLogLevel('debug');
      this.unsubscribe = firebase
        .firestore()
        .collection('posts')
        .orderBy('created.on', 'desc')
        .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
          const posts: PostsState['posts'] = {
            items: [],
            criteria,
          };
          posts.items = documentSnapshot.docs.map((d) => {
            const val = convertDocumentDataToPost(d);
            return val;
          });
          this.notify(posts);
        });
    } else {
      this.unsubscribe = () => {
        console.warn('Unsubscribing PostsSubject that was never subscribed', {
          criteria,
        });
      };
    }
  }

  public destroy() {
    this.unsubscribe();
  }

  public attach(observer: PostsObserver) {
    this.observers.push(observer);
  }

  public detach(observer: PostsObserver) {
    this.observers = this.observers.filter((o) => observer !== o);
  }

  public notify(posts: PostsType) {
    this.observers.forEach((o) => o(posts));
  }
}

export const watchPosts = (
  criteria: PostCriteria,
): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (
    dispatch: ThunkDispatch<State, {}, Action>,
    getState: () => State,
    firebase: firebase.app.App,
  ): Promise<void> => {
    return new Promise<void>((resolve) => {
      const {user} = getState();
      if (user) {
        //firestore.setLogLevel('debug');
        firebase
          .firestore()
          .collection('posts')
          .orderBy('created.on')
          .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
            const posts: PostsState['posts'] = {
              items: [],
              criteria,
            };
            posts.items = documentSnapshot.docs.map((d) => {
              const val = convertDocumentDataToPost(d);
              return val;
            });
            dispatch(ReplacePostsAction(posts));
          });
      }
    });
  };
};

export const addPost = async (
  user: User | false,
  post: Post,
  firebase = firebaseInstance,
): Promise<string> => {
  if (!user) {
    return new Promise<string>((re, rj) => rj('not authenticated'));
  } else if (user.getIdToken) {
    const path = post.criteria.key ? `${post.criteria.key.type}` : 'posts';
    return user.getIdToken().then(async (token) =>
      (
        await fetch(
          `https://us-central1-ineffectua.cloudfunctions.net/api/v1/${path}`,
          {
            method: 'PUT',
            headers: new Headers({
              Authorization: 'Bearer ' + token,
              ContentType: 'application/json',
            }),
            body: JSON.stringify(post),
          },
        )
      ).json(),
    );
  } else {
    return new Promise<string>((re, rj) => rj('unknown authentication error'));
  }
};

export const addPostWithDispatch = (
  post: Post,
): ThunkAction<Promise<string>, State, firebase.app.App, Action> => {
  return (
    dispatch: ThunkDispatch<State, {}, Action>,
    getState: () => State,
    firebase: firebase.app.App,
  ): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const {user} = getState();
      if (user) {
        addPost(user, post).then(resolve).catch(reject);
      } else {
        reject('Please authenticate');
      }
    });
  };
};
