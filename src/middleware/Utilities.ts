import {User} from '../reducers/AuthReducer';

export type WrappedPromise<T> = {
  read: () => T;
};

export function wrapPromise<T>(promise: Promise<T>): WrappedPromise<T> {
  let status = 'pending';
  let result: T;
  let suspender: Promise<T> = promise.then(
    (r) => {
      status = 'success';
      result = r;
      return r;
    },
    (e) => {
      status = 'error';
      result = e;
      return e;
    },
  );
  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw result;
      } else if (status === 'success') {
        return result;
      } else {
        throw suspender;
      }
    },
  };
}

export function getFirebaseDataWithUser<T>(
  user: User | false,
  path: string,
  cursor = 0,
): Promise<T> {
  if (!user) {
    return new Promise<T>((re, rj) => rj('Unauthorized'));
  } else {
    if (user.getIdToken) {
      return user.getIdToken().then((token) =>
        fetch(
          `https://us-central1-ineffectua.cloudfunctions.net/api/v1/${path}/${cursor}`,
          {
            headers: new Headers({
              Authorization: 'Bearer ' + token,
            }),
          },
        ).then((promise) => promise.json()),
      );
    } else {
      return new Promise<T>((re, rj) =>
        rj('User object not properly initialized'),
      );
    }
  }
}

export function setFirebaseDataWithUser<T>(
  user: User | false,
  path: string,
  data: T,
  method: 'PUT' | 'DELETE' = 'PUT',
): Promise<T> {
  if (!user) {
    return new Promise<T>((re, rj) => rj('Unauthorized'));
  } else {
    if (user.getIdToken) {
      return user.getIdToken().then(async (token) =>
        (
          await fetch(
            `https://us-central1-ineffectua.cloudfunctions.net/api/v1/${path}`,
            {
              method,
              headers: new Headers({
                Authorization: 'Bearer ' + token,
                ContentType: 'application/json',
              }),
              body: JSON.stringify(data),
            },
          )
        ).json(),
      );
    } else {
      return new Promise<T>((re, rj) =>
        rj('User object not properly initialized'),
      );
    }
  }
}
