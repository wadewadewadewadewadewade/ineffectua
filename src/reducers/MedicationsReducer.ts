import { Medication } from '../Types';

export const GET_MEDICATIONS= 'GET_MEDICATIONS';
export const SET_MEDICATIONS= 'SET_MEDICATIONS';
export const REPLACE_MEDICATIONS= 'REPLACE_MEDICATIONS';

export type Action = {
    type: 'SET_MEDICATIONS';
    medications: MedicationsState['medications']
  } | {
    type: 'GET_MEDICATIONS';
    medications: MedicationsState['medications']
  } | {
    type: 'REPLACE_MEDICATIONS';
    medications: MedicationsState['medications']
  };

export const GetMedicationsAction = (medications: MedicationsState['medications']): Action => ({
  type: GET_MEDICATIONS,
  medications
});

export const SetMedicationsAction = (medications: MedicationsState['medications']): Action => ({
  type: SET_MEDICATIONS,
  medications
});

export const ReplaceMedicationsAction = (medications: MedicationsState['medications']): Action => ({
  type: SET_MEDICATIONS,
  medications
});

export type MedicationsState = {
  medications: {
    [id: string]: Medication
  }
}

export const initialState = {};

export default function MedicationsReducer(
  prevState = initialState,
  action: Action
): MedicationsState['medications'] {
  switch (action.type) {
    case GET_MEDICATIONS:
    case SET_MEDICATIONS:
      return {
        ...prevState,
        ...action.medications
      };
    case REPLACE_MEDICATIONS:
      return action.medications
    default:
      return prevState
  }
}
