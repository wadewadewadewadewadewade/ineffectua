export type Tag = {
  key: string;
  name: string;
  path: string;
  created?: {
    by: string;
    on: Date;
    from?: string;
  };
  //searchableIndex?: { [key: string]: boolean }
};

export type UserTag = {
  key: string;
  tagId: string;
};

export type TagsType = {
  [id: string]: Tag;
};

export type TagsState = {
  tags: TagsType;
};

export const initialState: TagsType = {};

export const GET_TAGS = 'GET_TAGS';
export const ADD_TAG = 'GET_TAGS';

export type Action =
  | {
      type: 'ADD_TAG';
      tags: TagsType;
    }
  | {
      type: 'GET_TAGS';
      tags: TagsType;
    };

export const GetTagsAction = (tags: TagsType): Action => ({
  type: GET_TAGS,
  tags,
});

export const SetTagAction = (tags: TagsType): Action => ({
  type: ADD_TAG,
  tags,
});

export default function DataTypesReducer(
  prevState = initialState,
  action: Action,
): TagsType {
  switch (action.type) {
    case GET_TAGS:
    case ADD_TAG:
      return {
        ...prevState,
        ...action.tags,
      };
    default:
      return prevState;
  }
}
