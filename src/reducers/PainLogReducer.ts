export type PainLogType = {
  [id: string]: PainLogLocation;
};

export type PainLogLocation = {
  key: string;
  created: Date;
  typeId?: string;
  position?: {
    x: number;
    y: number;
  };
  title?: string;
  active?: boolean;
  description?: string;
  severity?: number;
  medications?: Array<string>;
  previous?: string;
  next?: string;
};

export type PainLogState = {
  painlog: PainLogType;
};

export const initialState = {};

export const GET_PAINLOGLOCATIONS = 'GET_PAINLOGLOCATIONS';
export const SET_PAINLOGLOCATIONS = 'SET_PAINLOGLOCATIONS';
export const REPLACE_PAINLOGLOCATIONS = 'REPLACE_PAINLOGLOCATIONS';

export type Action =
  | {
      type: 'SET_PAINLOGLOCATIONS';
      painlog: PainLogType;
    }
  | {
      type: 'GET_PAINLOGLOCATIONS';
      painlog: PainLogType;
    }
  | {
      type: 'REPLACE_PAINLOGLOCATIONS';
      painlog: PainLogType;
    };

export const GetPainLogAction = (painlog: PainLogType): Action => ({
  type: GET_PAINLOGLOCATIONS,
  painlog,
});

export const SetPainLogAction = (painlog: PainLogType): Action => ({
  type: SET_PAINLOGLOCATIONS,
  painlog,
});

export const ReplacePainLogAction = (painlog: PainLogType): Action => ({
  type: SET_PAINLOGLOCATIONS,
  painlog,
});

export default function PainLogReducer(
  prevState = initialState,
  action: Action,
): PainLogType {
  switch (action.type) {
    case GET_PAINLOGLOCATIONS:
    case SET_PAINLOGLOCATIONS:
      return {
        ...prevState,
        ...action.painlog,
      };
    case REPLACE_PAINLOGLOCATIONS:
      return action.painlog;
    default:
      return prevState;
  }
}
