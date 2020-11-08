import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {Action} from '../reducers';
import {SignInAction, SignInCompleteAction, SignOutAction, User} from './../reducers/AuthReducer';
import {State} from './../Types';
import {firebase as firebaseInstance} from '../firebase/config';

const firebaseUserToUser = (
  user: firebase.User,
  passedEmailAddress: string,
) => {
  const {uid, email, displayName, photoURL} = user;
  const data: User = {
    uid,
    email: email ? email : passedEmailAddress,
    getIdToken: (forceRefresh?: boolean | undefined) =>
      user.getIdToken(forceRefresh),
    displayName: displayName ? displayName : undefined,
    photoURL: photoURL && photoURL.length > 0 ? new URL(photoURL) : undefined,
    isVerified: false,
  };
  return data;
};

const firebaseUserDocumentToUser = (
  uid: string,
  userDocument: firebaseInstance.firestore.DocumentData,
) => {
  const {email, displayName, photoURL, isVerified} = userDocument;
  const data: User = {
    uid,
    email,
    displayName,
    photoURL: photoURL && photoURL.length > 0 ? new URL(photoURL) : undefined,
    public: userDocument.public,
    isVerified
  };
  return data;
};

export const getUserById = (
  userId: string,
  firebase = firebaseInstance,
): Promise<User> => {
  return new Promise<User>((resolve, reject) => {
    firebase
      .firestore()
      .collection('users')
      .doc(userId)
      .get()
      .then(
        (
          value: firebase.firestore.DocumentSnapshot<
            firebase.firestore.DocumentData
          >,
        ) => {
          const userData = value.data();
          if (userData === undefined) {
            reject('No user information was returned');
          } else {
            const user: User = firebaseUserDocumentToUser(value.id, userData);
            resolve(user);
          }
        },
      );
  });
};

export const updateUserById = (
  userId: string,
  values: {isVerified?: boolean, displayName?: string, photoURL?: string, password?: string},
  errorCallback?: (e: any) => void,
  firebase = firebaseInstance,
): Promise<User> => {
  return new Promise<User>((resolve, reject) => {
    firebase
      .firestore()
      .collection('users')
      .doc(userId)
      .set(values)
      .catch(errorCallback)
      .then(
        () => {
          getUserById(userId).then((userData) => {
            if (userData === undefined) {
              reject('No user information was returned');
            } else {
              resolve(userData);
            }
          })
        },
      );
  });
};

export const authenticate = (
  email: string,
  password: string,
  errorCallback?: (e: any) => void,
): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return async (
    dispatch: ThunkDispatch<State, {}, Action>,
    getState: () => State,
    firebase: firebase.app.App,
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((response: firebase.auth.UserCredential) => {
          if (response && response.user) {
            const user = firebaseUserToUser(response.user, email);
            if (user.isVerified) {
              dispatch(SignInAction(user));
            } else {
              dispatch(SignInCompleteAction(user));
            }
            resolve();
          } else {
            reject('No user information returned from firebase');
          }
        })
        .catch(errorCallback);
    });
  };
};

export const register = (
  email: string,
  errorCallback?: (e: any) => void,
): ThunkAction<Promise<void>, State, firebase.app.App, Action> => {
  return async (
    dispatch: ThunkDispatch<State, {}, Action>,
    getState: () => State,
    firebase: firebase.app.App,
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: 'https://us-central1-ineffectua.cloudfunctions.net/api/v1/users/finishCreation',
        // This must be true.
        handleCodeInApp: true,
        iOS: {
          bundleId: 'com.ineffectua'
        },
        android: {
          packageName: 'com.ineffectua',
          installApp: true,
          minimumVersion: '12'
        },
        dynamicLinkDomain: 'example.page.link'
      };
      
      firebase
        .auth()
        .sendSignInLinkToEmail(email, actionCodeSettings)
        .catch(errorCallback)
        .then((response: void | firebase.auth.UserCredential) => {
          if (response && response.user) {
            const user = firebaseUserToUser(response.user, email);
            updateUserById(user.uid, {isVerified: false}).then((user) => {
              dispatch(SignInAction(user));
              resolve();
            });
          } else {
            reject('No user information returned from firebase');
          }
      });
    });
  };
};

export const signOut = (): ThunkAction<
  Promise<void>,
  State,
  firebase.app.App,
  Action
> => {
  return async (
    dispatch: ThunkDispatch<State, {}, Action>,
    getState: () => State,
    firebase: firebase.app.App,
  ): Promise<void> => {
    return new Promise<void>((resolve) => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          dispatch(SignOutAction());
          resolve();
        });
    });
  };
};

//(dispatch: () => void, state: () => State, firebase: any) => (next: Function) => (action: Action)
