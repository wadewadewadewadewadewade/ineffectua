import { DataType } from '../Types';

export const GET_TYPES= 'GET_TYPES';
export const SET_TYPES= 'SET_TYPES';
export const REPLACE_TYPES= 'REPLACE_TYPES';

export type Action = {
    type: 'SET_TYPES';
    datatypes: DataTypesState['datatypes']
  } | {
    type: 'GET_TYPES';
    datatypes: DataTypesState['datatypes']
  } | {
    type: 'REPLACE_TYPES';
    datatypes: DataTypesState['datatypes']
  };

export const GetDataTypesAction = (datatypes: DataTypesState['datatypes']): Action => ({
  type: GET_TYPES,
  datatypes
});

export const SetDataTypesAction = (datatypes: DataTypesState['datatypes']): Action => ({
  type: SET_TYPES,
  datatypes
});

export const ReplaceDataTypesAction = (datatypes: DataTypesState['datatypes']): Action => ({
  type: SET_TYPES,
  datatypes
});

export type DataTypesState = {
  datatypes: {
    [id: string]: DataType
  }
}

export const initialState = {};

export default function DataTypesReducer(
  prevState = initialState,
  action: Action
): DataTypesState['datatypes'] {
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
