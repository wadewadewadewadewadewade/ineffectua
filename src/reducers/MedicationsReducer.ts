export type Medication = {
  key?: string;
  created?: Date;
  typeId?: string;
  name: string;
  active: boolean;
  prescribed?: string;
  lastFilled?: Date;
  refills?: number;
  description?: string;
};

export type MedicationsType = {
  [id: string]: Medication;
};

export type MedicationsState = {
  medications: MedicationsType;
};

export const initialState: MedicationsType = {};

export const GET_MEDICATIONS = 'GET_MEDICATIONS';
export const SET_MEDICATIONS = 'SET_MEDICATIONS';
export const REPLACE_MEDICATIONS = 'REPLACE_MEDICATIONS';

export type Action =
  | {
      type: 'SET_MEDICATIONS';
      medications: MedicationsType;
    }
  | {
      type: 'GET_MEDICATIONS';
      medications: MedicationsType;
    }
  | {
      type: 'REPLACE_MEDICATIONS';
      medications: MedicationsType;
    };

export const GetMedicationsAction = (medications: MedicationsType): Action => ({
  type: GET_MEDICATIONS,
  medications,
});

export const SetMedicationsAction = (medications: MedicationsType): Action => ({
  type: SET_MEDICATIONS,
  medications,
});

export const ReplaceMedicationsAction = (
  medications: MedicationsType,
): Action => ({
  type: SET_MEDICATIONS,
  medications,
});

export default function MedicationsReducer(
  prevState = initialState,
  action: Action,
): MedicationsType {
  switch (action.type) {
    case GET_MEDICATIONS:
    case SET_MEDICATIONS:
      return {
        ...prevState,
        ...action.medications,
      };
    case REPLACE_MEDICATIONS:
      return action.medications;
    default:
      return prevState;
  }
}
