import { Contact } from '../Types';

export const GET_CONTACTS= 'GET_CONTACTS';
export const SET_CONTACTS= 'SET_CONTACTS';
export const REPLACE_CONTACTS= 'REPLACE_CONTACTS';

export type Action = {
    type: 'SET_CONTACTS';
    contacts: ContactsState['contacts']
  } | {
    type: 'GET_CONTACTS';
    contacts: ContactsState['contacts']
  } | {
    type: 'REPLACE_CONTACTS';
    contacts: ContactsState['contacts']
  };

export const GetContactsAction = (contacts: ContactsState['contacts']): Action => ({
  type: GET_CONTACTS,
  contacts
});

export const SetContactsAction = (contacts: ContactsState['contacts']): Action => ({
  type: SET_CONTACTS,
  contacts
});

export const ReplaceContactsAction = (contacts: ContactsState['contacts']): Action => ({
  type: SET_CONTACTS,
  contacts
});

export type ContactsState = {
  contacts: {
    [id: string]: Contact
  }
}

export const initialState = {};

export default function ContactsReducer(
  prevState = initialState,
  action: Action
): ContactsState['contacts'] {
  switch (action.type) {
    case GET_CONTACTS:
    case SET_CONTACTS:
      return {
        ...prevState,
        ...action.contacts
      };
    case REPLACE_CONTACTS:
      return action.contacts
    default:
      return prevState
  }
}
