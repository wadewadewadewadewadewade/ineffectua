export type PainLogLocation = {
  key?: string,
  created?: Date,
  typeId?: string,
  position?: {
    x: number,
    y: number,
  },
  title?: string,
  active?: boolean,
  description?: string,
  severity?: number,
  medications?: Array<string>
  previous?: string
  next?: string
}

export type PainLogType = {
  [id: string]: PainLogLocation
}

export type PainLogState = {
  painlog: PainLogType
}

export const initialState: PainLogType = {};

export const GET_PAINLOGLOCATIONS= 'GET_PAINLOGLOCATIONS';
export const SET_PAINLOGLOCATIONS= 'SET_PAINLOGLOCATIONS';
export const REPLACE_PAINLOGLOCATIONS= 'REPLACE_PAINLOGLOCATIONS';

export type Action = {
    type: 'SET_PAINLOGLOCATIONS';
    contacts: PainLogType
  } | {
    type: 'GET_PAINLOGLOCATIONS';
    contacts: PainLogType
  } | {
    type: 'REPLACE_PAINLOGLOCATIONS';
    contacts: PainLogType
  };

export const GetPainLogAction = (contacts: PainLogType): Action => ({
  type: GET_PAINLOGLOCATIONS,
  contacts
});

export const SetPainLogAction = (contacts: PainLogType): Action => ({
  type: SET_PAINLOGLOCATIONS,
  contacts
});

export const ReplacePainLogAction = (contacts: PainLogType): Action => ({
  type: SET_PAINLOGLOCATIONS,
  contacts
});

export default function PainLogReducer(
  prevState = initialState,
  action: Action
): PainLogType {
  switch (action.type) {
    case GET_PAINLOGLOCATIONS:
    case SET_PAINLOGLOCATIONS:
      return {
        ...prevState,
        ...action.contacts
      };
    case REPLACE_PAINLOGLOCATIONS:
      return action.contacts
    default:
      return prevState
  }
}
