import {UserName} from './../reducers/AuthReducer';
import {Post, initialCriteria, PostCriteria} from '../reducers/PostsReducer';
import {User} from '../reducers/AuthReducer';
import {setFirebaseDataWithUser, getFirebaseDataWithUser} from './Utilities';

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

/*const convertDocumentDataToPost = (
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
};*/

export const fetchPosts = async (
  user: User | false,
  criteria: PostCriteria,
  cursor = 0,
): Promise<Array<Post>> => {
  const path = criteria.key
    ? `posts/${criteria.key.type}/${criteria.key.id}`
    : 'posts/posts';
  return getFirebaseDataWithUser<Array<Post>>(user, path, cursor).then((v) => {
    for (let p in v) {
      v[p].created.on = new Date(v[p].created.on);
    }
    return v;
  });
};

/*export type PostsObserver = (posts: PostsType) => void;

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
}*/

export const addPost = async (
  user: User | false,
  post: Post,
): Promise<Post> => {
  const path = post.criteria.key
    ? post.criteria.key.type === 'posts'
      ? 'posts/posts'
      : `posts/${post.criteria.key.type}`
    : 'posts/posts';
  return setFirebaseDataWithUser(user, path, post);
};

export const deletePost = (user: User, post: Post): Promise<Post> => {
  const path = post.criteria.key
    ? post.criteria.key.type === 'posts'
      ? 'posts/posts'
      : `posts/${post.criteria.key.type}`
    : 'posts/posts';
  return setFirebaseDataWithUser(user, path, post, 'DELETE');
};

export const getPostById = (
  user: User,
  criteria: PostCriteria,
  key: string,
): Promise<Post> => {
  const path = criteria.key
    ? criteria.key.type === 'posts'
      ? 'posts/posts'
      : `posts/${criteria.key.type}`
    : 'posts/posts';
  return getFirebaseDataWithUser<Post>(user, `${path}/${key}`).then((p) => {
    p.created.on = new Date(p.created.on);
    return p;
  });
};

export const getUserMessageNames = (user: User): Promise<Array<UserName>> => {
  return getFirebaseDataWithUser(user, 'messages');
};
