
export type Post = {
  key?: string,
  body: string,
  tags: Array<string>,
  criteria: PostCriteria,
  created?: {
    by: string,
    on: Date,
    from?: string
  },
}

export enum PostPrivacy {
  'PUBLIC' = 0,
  'PRIVATE' = 1,
  'FRIENDS' = 2,
}

export const getPostPrivacyName = (privacy: PostPrivacy) => {
  switch (privacy) {
    case PostPrivacy.FRIENDS:
      return 'Friends'
    case PostPrivacy.PRIVATE:
      return 'Private'
    default:
      return 'Public'
  }
}

export type PostCriteria = {
  tagId?: string,
  recipientId?: string
  privacy: PostPrivacy
}

export type PostsType = {
  items: Array<Post>,
  criteria: PostCriteria
}

export type PostsState = {
  posts:PostsType
}

export const initialCriteria: PostCriteria = { privacy: 0 }
export const initialState: PostsType = { items: [], criteria: initialCriteria};

export const GET_POSTS= 'GET_POSTS';
export const SET_POSTS= 'SET_POSTS';
export const REPLACE_POSTS= 'REPLACE_POSTS';

export type Action = {
    type: 'SET_POSTS';
    posts: PostsType
  } | {
    type: 'GET_POSTS';
    posts: PostsType
  } | {
    type: 'REPLACE_POSTS';
    posts: PostsType
  };

export const GetPostsAction = (posts: PostsType): Action => ({
  type: GET_POSTS,
  posts
});

export const SetPostsAction = (posts: PostsType): Action => ({
  type: SET_POSTS,
  posts
});

export const ReplacePostsAction = (posts: PostsType): Action => ({
  type: SET_POSTS,
  posts
});

export default function PostsReducer(
  prevState = initialState,
  action: Action
): PostsType {
  switch (action.type) {
    case GET_POSTS:
    case SET_POSTS:
      return {
        ...prevState,
        ...action.posts
      };
    case REPLACE_POSTS:
      return action.posts
    default:
      return prevState
  }
}
