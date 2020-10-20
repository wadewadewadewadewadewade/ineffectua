export type Contact = {
  key: string;
  created: Date;
  typeId?: string;
  name: string;
  number?: string;
  email?: string;
  location?: string;
  description?: string;
};

export type ContactsType = {
  [id: string]: Contact;
};

export type ContactsState = {
  contacts: ContactsType;
};

export const initialState: ContactsType = {};

export const GET_CONTACTS = 'GET_CONTACTS';
export const SET_CONTACTS = 'SET_CONTACTS';
export const REPLACE_CONTACTS = 'REPLACE_CONTACTS';

export type Action =
  | {
      type: 'SET_CONTACTS';
      contacts: ContactsType;
    }
  | {
      type: 'GET_CONTACTS';
      contacts: ContactsType;
    }
  | {
      type: 'REPLACE_CONTACTS';
      contacts: ContactsType;
    };

export const GetContactsAction = (contacts: ContactsType): Action => ({
  type: GET_CONTACTS,
  contacts,
});

export const SetContactsAction = (contacts: ContactsType): Action => ({
  type: SET_CONTACTS,
  contacts,
});

export const ReplaceContactsAction = (contacts: ContactsType): Action => ({
  type: SET_CONTACTS,
  contacts,
});

export default function ContactsReducer(
  prevState = initialState,
  action: Action,
): ContactsType {
  switch (action.type) {
    case GET_CONTACTS:
    case SET_CONTACTS:
      return {
        ...prevState,
        ...action.contacts,
      };
    case REPLACE_CONTACTS:
      return action.contacts;
    default:
      return prevState;
  }
}
