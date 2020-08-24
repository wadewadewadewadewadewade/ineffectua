import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const RESTORE_TOKEN = 'RESTORE_TOKEN';
export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';

export type Action =
  | { type: 'RESTORE_TOKEN'; token: false | FirebaseAuthTypes.User }
  | { type: 'SIGN_IN'; token: false | FirebaseAuthTypes.User }
  | { type: 'SIGN_OUT' };

export const SignInAction = (user: AuthState['user']): Action => ({ type: SIGN_IN, token: user })
export const SignOutAction = (): Action => ({ type: SIGN_OUT })

export type AuthState = {
  user: FirebaseAuthTypes.User | false
}

export const initialState: AuthState = {
  user: false
}

export const isUserAuthenticated = (user: FirebaseAuthTypes.User | false): boolean => {
  return user !== undefined && user !== false
}

export default function AuthReducer(prevState = initialState['user'], action: Action): AuthState['user'] {
  switch (action.type) {
    case RESTORE_TOKEN:
      return action.token;
    case SIGN_IN:
      return action.token;
    case SIGN_OUT:
      return false;
    default:
      return prevState
  }
};
