import {User} from './../reducers/AuthReducer';
import {ContactsType} from './../reducers/ContactsReducer';
import {Contact, ContactsState} from '../reducers/ContactsReducer';
import {firebaseDocumentToArray} from '../firebase/utilities';
import {getFirebaseDataWithUser, setFirebaseDataWithUser} from './Utilities';

export const newContactName = '+ Add New Contact';
export const emptyContact: Contact = {name: ''};

export const contactIsValid = (
  contact: Contact,
  Contacts: ContactsState['contacts'],
): boolean => {
  const {name} = contact;
  if (name && name.trim().length > 0) {
    // no null or empty names or colors
    if (name.trim() !== newContactName) {
      // no reserved names
      const preexistingContactsByname = firebaseDocumentToArray(
        Contacts,
      ).filter((c: Contact) => (c.name = name.trim()));
      if (preexistingContactsByname.length === 0) {
        // no duplicate names
        return true;
      }
    }
  }
  return false;
};

export const getContacts = (user: User): Promise<ContactsType> => {
  return getFirebaseDataWithUser(user, 'users/contacts');
};

export const addContact = (user: User, contact: Contact): Promise<Contact> => {
  return setFirebaseDataWithUser(user, 'users/contacts', contact);
};
