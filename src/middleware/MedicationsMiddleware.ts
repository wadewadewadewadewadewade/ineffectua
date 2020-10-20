import {User} from './../reducers/AuthReducer';
import {MedicationsType} from './../reducers/MedicationsReducer';
import {Medication, MedicationsState} from '../reducers/MedicationsReducer';
import {firebaseDocumentToArray} from '../firebase/utilities';
import {getFirebaseDataWithUser, setFirebaseDataWithUser} from './Utilities';

export const newMedicationName = '+ Add New Medication';
export const emptyMedication: Medication = {
  key: '',
  created: new Date(-1),
  name: '',
  active: true,
};

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
  return getFirebaseDataWithUser<MedicationsType>(
    user,
    'users/medications',
  ).then((m) => {
    const keys = Object.keys(m);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const medication = m[key];
      medication.created = new Date(medication.created);
      medication.lastFilled =
        medication.lastFilled && new Date(medication.lastFilled);
    }
    return m;
  });
};

export const addMedication = (
  user: User,
  medication: Medication,
): Promise<Medication> => {
  return setFirebaseDataWithUser<Medication>(
    user,
    'users/medications',
    medication,
  ).then((m) => {
    m.created = new Date(m.created);
    m.lastFilled = m.lastFilled && new Date(m.lastFilled);
    return m;
  });
};

export const deleteMedication = (
  user: User,
  medication: Medication,
): Promise<Medication> => {
  return setFirebaseDataWithUser<Medication>(
    user,
    'users/medications',
    medication,
    'DELETE',
  ).then((m) => {
    m.created = new Date(m.created);
    m.lastFilled = m.lastFilled && new Date(m.lastFilled);
    return m;
  });
};
