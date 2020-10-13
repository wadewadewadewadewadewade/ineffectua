import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Action } from '../reducers';
import { SignInAction, SignOutAction, User } from './../reducers/AuthReducer';
import { State } from './../Types';
import { firebase as firebaseInstance } from '../firebase/config';

const firebaseUserToUser = (user: firebase.User, passedEmailAddress: string) => {
  const { 
    uid,
    email,
    displayName,
    photoURL
  } = user;
  const data: User = {
    uid,
    email: email ? email : passedEmailAddress,
    displayName: displayName ? displayName : undefined,
    photoURL: photoURL && photoURL.length > 0 ? new URL(photoURL) : undefined
  }
  return data
}

export const getUserById = (userId: string, firebase = firebaseInstance): Promise<User> => {
  return new Promise<User>((resolve, reject) => {
    firebase.firestore().collection('users')
    .doc(userId)
    .get()
    .then((value: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => {
      resolve(value.data() as User)
    })
  })
}

export const authenticate = (email: string, password: string, errorCallback?: (e: any) => void, isCreation?: boolean): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (isCreation) {
        firebase.auth()
        .createUserWithEmailAndPassword(email, password)
        .catch(errorCallback)
        .then((response: void | firebase.auth.UserCredential) => {
          if (response && response.user) {
            const user = firebaseUserToUser(response.user, email)
            firebase.firestore().collection('users')
              .doc(user.uid)
              .set(user)
              .catch(errorCallback)
            .then(() => {
              dispatch(SignInAction(user))
              resolve();
            })
          } else {
            reject('No user information returned from firebase')
          }
        })
      } else {
        firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then((response: firebase.auth.UserCredential) => {
          if (response && response.user) {
            const user = firebaseUserToUser(response.user, email)
            dispatch(SignInAction(user))
            resolve();
          } else {
            reject('No user information returned from firebase')
          }
        })
        .catch(errorCallback)
      }
    })
  }
}

export const signOut = (): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve) => {
      firebase.auth().signOut()
        .then(() => {
          dispatch(SignOutAction())
          resolve()
        })
    })
  }
}

//(dispatch: () => void, state: () => State, firebase: any) => (next: Function) => (action: Action)
