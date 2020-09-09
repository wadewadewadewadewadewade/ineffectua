import * as React from 'react';
import { State } from './../Types';
import { GetContactsAction, ReplaceContactsAction, ContactsState } from '../reducers/ContactsReducer';
import { Action, isFetching } from './../reducers';
import { Contact } from '../Types';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { DocumentData, DocumentReference } from '@firebase/firestore-types';

export const newContactName = '+ Add New Contact';
export const emptyContact: Contact = {name:'',};

export const contactsToArray = (Contacts: ContactsState['contacts']) => {
  const ContactsArray = React.useMemo(() => {
    const arr = new Array<Contact>();
    const keys = Object.keys(Contacts);
    for(let i=0;i<keys.length;i++) {
      const dt = Contacts[keys[i]];
      dt.key = keys[i]
      arr.push(dt);
    }
    arr.push({name:newContactName})
    return arr;
  }, [Contacts])
  return ContactsArray
}

export const contactIsValid = (contact: Contact, Contacts: ContactsState['contacts']): boolean => {
  const { name } = contact;
  if (name && name.trim().length > 0) { // no null or empty names or colors
    if (name.trim() !== newContactName) { // no reserved names
      const preexistingContactsByname = contactsToArray(Contacts).filter(dt => dt.name = name.trim())
      if (preexistingContactsByname.length === 0) { // no duplicate names
        return true      
      }
    }
  }
  return false
}

const convertDocumentDataToContact = (data: firebase.firestore.DocumentData): Contact => {
  const doc = data.data()
  const contactData: Contact = {
    key: data.id,
    typeId: doc.typeId,
    name: doc.name,
    number: doc.number,
    email: doc.email,
    location: doc.location,
    description: doc.description
  }
  if (doc.created && doc.created.seconds) {
    contactData.created = new Date(doc.created.seconds * 1000)
  }
  return contactData
}

export const getContacts = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firebase.firestore.setLogLevel('debug');
        dispatch(isFetching(true))
        firebase.firestore().collection('users')
          .doc(user.uid).collection('contacts')
          .get()
          .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
            const contacts: ContactsState['contacts'] = {};
            const arr = querySnapshot.docs.map(d => {
              const val = convertDocumentDataToContact(d);
              return val
            })
            arr.forEach(d => { if (d.key) contacts[d.key] = d })
            dispatch(GetContactsAction(contacts))
            dispatch(isFetching(false))
          })
          .finally(() => {
            //console.log('resolving getContacts')
            resolve()
          })
      }
    })
  }
}

export const watchContacts = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firestore.setLogLevel('debug');
        firebase.firestore()
          .collection('users')
          .doc(user.uid)
          .collection('contacts')
          .orderBy('name')
          .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
            const contacts: ContactsState['contacts'] = {};
            const arr = documentSnapshot.docs.map(d => {
              const val = convertDocumentDataToContact(d);
              return val
            })
            arr.forEach(d => { if (d.key) contacts[d.key] = d })
            dispatch(ReplaceContactsAction(contacts));
          });
      }
    })
  }
}

export const addContact = (contact: Contact, onComplete?: (Contact: Contact) => void): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        dispatch(isFetching(true))
        if (contact.key) {
          // its an update
          const { key, ...data } = contact;
          firebase.firestore().collection('users')
            .doc(user.uid).collection('contacts')
            .doc(key).update(data)
            .then(() => {
              dispatch(isFetching(true))
              onComplete && onComplete(contact)
          })
        } else {
          // it's a new record
          contact.created = new Date(Date.now())
          firebase.firestore().collection('users')
            .doc(user.uid).collection('contacts')
            .add(contact)
            .then((value: DocumentReference<DocumentData>) => {
              dispatch(isFetching(true))
              const data = {...contact, key: value.id}
              onComplete && onComplete(data)
            })
        }
      }
    })
  }
}
