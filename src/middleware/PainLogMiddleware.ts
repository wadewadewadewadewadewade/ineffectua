import {PainLogType} from '../reducers/PainLogReducer';
import {PainLogLocation} from './../reducers/PainLogReducer';
import {firebaseDocumentToArray} from '../firebase/utilities';
import {User} from '../reducers/AuthReducer';
import {getFirebaseDataWithUser, setFirebaseDataWithUser} from './Utilities';

export const newPainLogLocationName = '+ Add New PainLogLocation';
export const emptyPainLogLocation: PainLogLocation = {created: new Date()};

type PainLogThread = {
  [isodate: string]: PainLogLocation;
};

type PainLogKey = {
  thread: number;
  isodate: string;
  date: Date;
};

const unknownPainLogKey: PainLogKey = {
  thread: -1,
  isodate: new Date().toISOString(),
  date: new Date(),
};

export class PainLogThreads {
  beginnings: Array<string> = []; // [thread] = isodate
  endings: Array<string> = []; // [thread] = isodate
  oldest: PainLogKey = unknownPainLogKey; // {date, isodate, thread}
  newest: PainLogKey = unknownPainLogKey; // {date, isodate, thread}
  hash: {
    [thread: number]: PainLogThread;
  } = {};
  getArray = (start: Date, end: Date): Array<PainLogLocation> => {
    const result = new Array<PainLogLocation>();
    const threadsToDiscard = new Array<number>();

    // if thread ends before window, or thread ending is inactive within window, remove it
    for (let thread = 0; thread < this.endings.length; thread++) {
      const isodate = this.endings[thread];
      const ending = new Date(Date.parse(this.endings[thread]));
      if (ending < start && !this.hash[thread][isodate].active) {
        threadsToDiscard.push(thread);
      }
    }

    // if thread starts after the window, remove it also
    for (let thread = 0; thread < this.beginnings.length; thread++) {
      const isodate = this.beginnings[thread];
      const beginning = new Date(Date.parse(isodate));
      if (beginning > end) {
        threadsToDiscard.push(thread);
      }
    }

    // now that we know which thrads to ignore, find newest keys that are still active within window
    const getNewestPainLogLocationWithinRangeByThread = (
      thread: PainLogThread,
    ) => {
      const isodates = Object.keys(thread).sort();
      const endString = end.toISOString();
      let locationNumber = 0;
      let isodate = isodates[locationNumber];
      let nextIsodate =
        isodates.length > locationNumber + 1
          ? isodates[locationNumber + 1]
          : undefined;
      while (nextIsodate && nextIsodate < endString) {
        locationNumber++;
        isodate = nextIsodate;
        nextIsodate =
          isodates.length > locationNumber + 1
            ? isodates[locationNumber + 1]
            : undefined;
      }
      return isodate;
    };
    for (let thread = 0; thread < this.beginnings.length; thread++) {
      if (threadsToDiscard.indexOf(thread) < 0) {
        const isodate = getNewestPainLogLocationWithinRangeByThread(
          this.hash[thread],
        );
        result.push(this.hash[thread][isodate]);
      }
    }

    // return what's left
    return result;
  };
  toJSON = () => {
    const data = {
      beginnings: this.beginnings,
      endings: this.endings,
      oldest: this.oldest,
      newest: this.newest,
      hash: this.hash,
    };
    return data;
  };

  constructor(painlog?: PainLogType) {
    if (!painlog) {
      return;
    }
    const painlogArray = firebaseDocumentToArray(painlog);

    /*const copyPortionOfLocation = (loc:PainLogLocation): PainLogLocation => {
      const { key, created, previous, next, ...rest } = loc
      return rest
    }*/

    const crawlThread = (
      current: PainLogLocation,
      thread: number,
      previousKey: PainLogKey = unknownPainLogKey,
    ) => {
      if (current && current.created) {
        if (!this.hash[thread]) {
          this.hash[thread] = {} as PainLogThread;
        }
        const date = current.created;
        const isodate = date.toISOString();
        if (previousKey !== unknownPainLogKey) {
          this.hash[thread][isodate] = {
            ...this.hash[previousKey.thread][previousKey.isodate],
            ...current, //...copyPortionOfLocation(current)
          };
        } else {
          this.hash[thread][isodate] = current; //copyPortionOfLocation(current)
        }
        const newKey: PainLogKey = {thread, isodate, date};
        if (this.oldest === unknownPainLogKey || this.oldest.date > date) {
          this.oldest = newKey;
        }
        if (this.newest === unknownPainLogKey || this.newest.date < date) {
          this.newest = newKey;
        }
        if (typeof current.next === 'string' && painlog[current.next]) {
          crawlThread(painlog[current.next], thread, newKey);
        } else if (current.next === undefined) {
          this.endings[thread] = isodate;
        }
      }
    };

    // filter the list of locations so it's just the thread begninnings,
    // and sort so the oldest location is first to se the 'oldest' property
    const arr = painlogArray
      .filter((p) => p.previous === undefined)
      .sort((a, b) => {
        if (!a.created || !b.created) {
          return -1;
        } else if (a.created < b.created) {
          return -1;
        } else {
          return 1;
        }
      });
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      if (current.created) {
        const isodate = current.created.toISOString();
        this.beginnings[i] = isodate;
        crawlThread(current, i);
      }
    }
  }
}

export const getPainLog = (user: User): Promise<PainLogType> => {
  return getFirebaseDataWithUser(user, 'users/painlog');
};

export const addPainLogLocation = (
  user: User,
  contact: PainLogLocation,
): Promise<PainLogLocation> => {
  return setFirebaseDataWithUser(user, 'users/contacts', contact);
};
