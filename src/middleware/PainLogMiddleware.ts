import {CalendarWindow} from './../reducers/CalendarReducer';
import {PainLogType} from '../reducers/PainLogReducer';
import {PainLogLocation} from './../reducers/PainLogReducer';
import {firebaseDocumentToArray} from '../firebase/utilities';
import {User} from '../reducers/AuthReducer';
import {getFirebaseDataWithUser, setFirebaseDataWithUser} from './Utilities';

export const newPainLogLocationName = '+ Add New PainLogLocation';
export const emptyPainLogLocation: PainLogLocation = {
  key: '',
  created: new Date(),
};

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

export const dateInDateWindow = (date: Date, window: CalendarWindow) => {
  // check if date is after window ends and date is before window starts (within window)
  if (date > window.ends && date < window.starts) {
    return true;
  }
  return false;
};

export class PainLogThreads {
  beginnings: Array<string> = []; // [thread] = isodate
  endings: Array<string> = []; // [thread] = isodate
  oldest: PainLogKey = unknownPainLogKey; // {date, isodate, thread}
  newest: PainLogKey = unknownPainLogKey; // {date, isodate, thread}
  hash: {
    [thread: number]: PainLogThread;
  } = {};

  push = (loc: PainLogLocation) => {
    // used to updae without rebuilding
    let found = false;
    let thread = 0;
    const newdate = loc.created;
    const isodate = newdate.toISOString();
    if (loc.previous !== undefined) {
      // found should be true if this is true, unless there's a bug...
      for (const t in Object.keys(this.hash)) {
        for (const date in this.hash[t]) {
          if (this.hash[t][date].key === loc.previous) {
            // the previous key is found
            thread = parseInt(t, 10);
            const {key, next, created, previous, ...rest} = this.hash[thread][
              date
            ];
            this.hash[thread][isodate] = {...rest, ...loc};
            found = true;
          }
        }
      }
    }
    if (!found) {
      // it's a new thread (loc.previous should be false, techncally)
      const maxThread = parseInt(
        Object.keys(this.hash).sort().reverse()[0],
        10,
      );
      thread = maxThread + 1;
      this.hash[thread] = {[isodate]: loc};
    }
    if (loc.created < new Date(this.beginnings[thread])) {
      this.beginnings[thread] = isodate;
    }
    if (loc.created > new Date(this.endings[thread])) {
      this.endings[thread] = isodate;
    }
    if (loc.created < this.oldest.date) {
      this.oldest.date = loc.created;
      this.oldest.isodate = isodate;
      this.oldest.thread = thread;
    }
    if (loc.created > this.newest.date) {
      this.newest.date = loc.created;
      this.newest.isodate = isodate;
      this.newest.thread = thread;
    }
    return this;
  };

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
  return getFirebaseDataWithUser<PainLogType>(user, 'users/painlog').then(
    (p) => {
      const keys = Object.keys(p);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const location = p[key];
        location.created = location.created && new Date(location.created);
      }
      return p;
    },
  );
};

export const getPainLogThreads = async (
  user: User,
): Promise<PainLogThreads> => {
  const painlog = await getPainLog(user);
  const threads = new PainLogThreads(painlog);
  return threads;
};

export const addPainLogLocation = (
  user: User,
  contact: PainLogLocation,
): Promise<PainLogLocation> => {
  return setFirebaseDataWithUser<PainLogLocation>(
    user,
    'users/painlog',
    contact,
  ).then((l) => {
    l.created = l.created && new Date(l.created);
    return l;
  });
};
