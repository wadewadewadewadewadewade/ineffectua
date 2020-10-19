import { User } from './../reducers/AuthReducer';
import { MedicationsType } from './../reducers/MedicationsReducer';
import {Medication, MedicationsState} from '../reducers/MedicationsReducer';
import {firebaseDocumentToArray} from '../firebase/utilities';
import { getFirebaseDataWithUser, setFirebaseDataWithUser } from './Utilities';

export const newMedicationName = '+ Add New Medication';
export const emptyMedication: Medication = {name: '', active: true};

export const medicaitonIsValid = (
  medicaiton: Medication,
  Medications: MedicationsState['medications'],
): boolean => {
  const {name} = medicaiton;
  if (name && name.trim().length > 0) {
    // no null or empty names or colors
    if (name.trim() !== newMedicationName) {
      // no reserved names
      const preexistingMedicationsByname = firebaseDocumentToArray(
        Medications,
      ).filter((m) => (m.name = name.trim()));
      if (preexistingMedicationsByname.length === 0) {
        // no duplicate names
        return true;
      }
    }
  }
  return false;
};

export const getMedications = (user: User): Promise<MedicationsType> => {
  return getFirebaseDataWithUser(user, 'users/medications');
};

export const addMedication = (user: User, medication: Medication): Promise<Medication> => {
  return setFirebaseDataWithUser(user, 'users/medications', medication);
};
