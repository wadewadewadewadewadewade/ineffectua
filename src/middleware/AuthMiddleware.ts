import { User } from 'firebase';
import { Action, SignInAction } from './../reducers/AuthReducer';
import { State } from './../Types';

const SignIn = async (dispatch: (action: Action) => void, getState: () => State, firebase: any) => (next: Function) => (action: Action) => {
  const { user } = getState();
  if (user) {
    const {
      uid,
      email,
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
      .catch((error: any) => {
          console.error(error)
      })
      .then(() => dispatch(SignInAction(user)))
  }
}

//(dispatch: () => void, state: () => State, firebase: any) => (next: Function) => (action: Action)

export default SignIn;