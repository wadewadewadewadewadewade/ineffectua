import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { isFetching, Action } from '../reducers';
import { SignInAction, SignOutAction } from './../reducers/AuthReducer';
import { State } from './../Types';

export const authenticate = (email: string, password: string, errorCallback?: (e: any) => void, isCreation?: boolean): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: firebase.app.App): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (isCreation) {
        firebase.auth()
          .createUserWithEmailAndPassword(email, password)
          .catch(errorCallback)
          .then((response: void | firebase.auth.UserCredential) => {
            if (response) {
              const { user } = response
              if (user) {
                const { 
                  uid,
                  displayName,
                  photoURL
                } = user;
                const data = {
                  uid,
                  email,
                  displayName,
                  photoURL
                }
                firebase.firestore().collection('users')
                  .doc(uid)
                  .set(data)
                  .catch(errorCallback)
                .then(() => {
                  dispatch(SignInAction(user))
                  dispatch(isFetching(false))
                  resolve();
                })
              }
            } else {
              reject('No response from firebase')
            }
          })
      } else {
        firebase.auth()
          .signInWithEmailAndPassword(email, password)
          .then((response: firebase.auth.UserCredential) => {
            const { user } = response
            if (user) {
              dispatch(SignInAction(user))
            }
            resolve();
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
