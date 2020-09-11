export type DataType = {
  key?: string,
  title: string,
  color: string
}

export type DataTypesType = {
  [id: string]: DataType
}

export type DataTypesState = {
  datatypes: DataTypesType
}

export const initialState: DataTypesType = {};

export const GET_TYPES= 'GET_TYPES';
export const SET_TYPES= 'SET_TYPES';
export const REPLACE_TYPES= 'REPLACE_TYPES';

export type Action = {
    type: 'SET_TYPES';
    datatypes: DataTypesType
  } | {
    type: 'GET_TYPES';
    datatypes: DataTypesType
  } | {
    type: 'REPLACE_TYPES';
    datatypes: DataTypesType
  };

export const GetDataTypesAction = (datatypes: DataTypesType): Action => ({
  type: GET_TYPES,
  datatypes
});

export const SetDataTypesAction = (datatypes: DataTypesType): Action => ({
  type: SET_TYPES,
  datatypes
});

export const ReplaceDataTypesAction = (datatypes: DataTypesType): Action => ({
  type: SET_TYPES,
  datatypes
});

export default function DataTypesReducer(
  prevState = initialState,
  action: Action
): DataTypesType {
  switch (action.type) {
    case GET_TYPES:
    case SET_TYPES:
      return {
        ...prevState,
        ...action.datatypes
      };
    case REPLACE_TYPES:
      return action.datatypes;
    default:
      return prevState
  }
}
