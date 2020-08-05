import { User } from 'firebase';

export const RESTORE_TOKEN = 'RESTORE_TOKEN';
export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';

export type Action =
  | { type: 'RESTORE_TOKEN'; token: undefined | User }
  | { type: 'SIGN_IN'; token: undefined | User }
  | { type: 'SIGN_OUT' };

export const SignInAction = (user: User): Action => ({ type: SIGN_IN, token: user })
export const SignOutAction = (): Action => ({ type: SIGN_OUT })

export type AuthState = {
  user: User | undefined
}

export const initialState: AuthState = {
  user: undefined
}

export default function AuthReducer(prevState = initialState, action: Action): AuthState {
  switch (action.type) {
    case RESTORE_TOKEN:
      return {
        ...prevState,
        user: action.token,
      };
    case SIGN_IN:
      return {
        ...prevState,
        user: action.token,
      };
    case SIGN_OUT:
      return {
        ...prevState,
        user: undefined,
      };
    default:
      return prevState
  }
};
