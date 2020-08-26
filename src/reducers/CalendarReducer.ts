import { CustomMarking } from 'react-native-calendars';
import { AuthState } from './AuthReducer';
import { CalendarEntry, CalendarWindow, CalendarRecord } from '../Types';
import { firebase } from '../firebase/config';
import { User } from 'firebase';
//import { useEffect } from 'react';

/*===== formatting tool ====*/
type AgendaItem = {
  name: string,
  height?: number
}

type AgendaDate = {
  [isoDate: string]: Array<AgendaItem>
}

type AgendaDateMarking = {
  [isoDate: string]: CustomMarking
}

type DateSpan = {
  years: number,
  days: number,
  hours: number,
  minutes: number,
  toString: () => string
}

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiff(a: Date, b: Date): string {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  let span = utc2 - utc1;
  const response: DateSpan = {
    years: Math.floor(span / (_MS_PER_DAY * 365)),
    days: 0,
    hours: 0,
    minutes: 0,
    toString: () => {
      const r = new Array<String>();
      if (response.years > 0) {
        r.push(response.years.toString() + ' years')
      }
      if (response.days > 0) {
        r.push(response.days.toString() + ' days')
      }
      if (response.hours > 0) {
        r.push(response.hours.toString() + ' hours')
      }
      if (response.minutes > 0) {
        r.push(response.minutes.toString() + ' minutes')
      }
      return r.join(', ');
    }
  };
  if (response.years > 0) {
    span = span - (response.years * _MS_PER_DAY * 365)
  }
  response.days = Math.floor(span / (_MS_PER_DAY))
  if (response.days > 0) {
    span = span - (response.days * _MS_PER_DAY)
  }
  response.hours = Math.floor(span / (_MS_PER_DAY / 24))
  if (response.hours > 0) {
    span = span - (response.hours * (_MS_PER_DAY / 24))
  }
  return response.toString()
}

export const formatDates = (dates: Array<CalendarEntry>): AgendaDate => {
  const response: AgendaDate = {};
  dates.forEach(date => {
    const { starts, ends } = date.window;
    const m = starts.getMonth();
    const d = starts.getDay();
    const isoDate = starts.getFullYear() + '-' + (m < 10 ? '0' + m.toString() : m.toString()) + '-' + (d < 10 ? '0' + d.toString() :d.toString());
    const duration = dateDiff(ends, starts)
    if (!response[isoDate]) {
      response[isoDate] = new Array<AgendaItem>()
    }
    response[isoDate].push({
      name: date.title + ' - ' + duration
    })
  })
  return response;
}

export const formatDatesForMarking = (dates: Array<CalendarEntry>): AgendaDateMarking => {
  const response: AgendaDateMarking = {};
  dates.forEach(date => {
    const { starts, ends } = date.window;
    const m = starts.getMonth();
    const d = starts.getDay();
    const isoDate = starts.getFullYear() + '-' + (m < 10 ? '0' + m.toString() : m.toString()) + '-' + (d < 10 ? '0' + d.toString() :d.toString());
    response[isoDate].customStyles = {
      container: { backgroundColor: 'rgba(255,0,0,0.5)'},
      text: { color: '#fff'}
    }
  })
  return response;
}

export const GET_DATES= 'GET_DATES';
export const SET_DATE= 'SET_DATE';

export type Action = {
    type: 'SET_DATE';
    dates: CalendarRecord['items']
  } | {
    type: 'GET_DATES';
    dates: CalendarRecord
  };

export const GetDatesAction = (dates: CalendarRecord): Action => ({
  type: GET_DATES,
  dates
});

export const SetDateAction = (date: CalendarEntry): Action => ({
  type: SET_DATE,
  dates: [date]
});

export async function GetDates(
  user: User,
  window?: CalendarWindow,
): Promise<CalendarRecord> {
  if (!window) {
    window = {
      starts: new Date(Date.now()),
      ends: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  }
  firebase.firestore.setLogLevel('debug');
  console.log('user.uid', user.uid);
  let dates: void | Array<CalendarEntry> = await firebase.firestore().collection('users')
    .doc(user.uid).collection('calendar')
    .where('start', '>=', window.starts).where('start', '<=', window.ends)
    .orderBy('start')
    .get()
    .then((querySnapshot) => {
      (querySnapshot.docs.map(d => d.data()))
    })
  if (!dates) {
    dates = new Array<CalendarEntry>();
  }
  return {
    window: window,
    items: dates
  };
}

export function ObserveDates(
  user: User,
  observer: (dates: Array<CalendarEntry>) => void
): () => void {
  //firestore.setLogLevel('debug');
  //useEffect(() => {
    const subscriber = firebase.firestore()
      .collection('users')
      .doc(user.uid)
      .collection('calendar')
      .onSnapshot(documentSnapshot => {
        observer(documentSnapshot.docs.map(snap => snap.data() as CalendarEntry));
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  //}, [user]);
}

export const getDates = (
  dispatch: (value: Action) => void,
  user: AuthState['user'],
  callback: Function,
  window?: CalendarWindow
) => new Promise<void>((success,fail) => {
  if (user) {
    GetDates(user, window).then(d => {
      dispatch(GetDatesAction(d));
      callback();
      success();
    })
  } else {
    fail()
  }
})

export async function SetDate(
  user: User,
  date: CalendarEntry,
): Promise<CalendarEntry | undefined> {
  //firestore.setLogLevel('debug');
  return await firebase.firestore().collection('users')
    .doc(user.uid).collection('calendar')
    .add(date)
    .then(snap => snap.get().then(doc => doc.data() as CalendarEntry));
}
  
export const setDate = (
  dispatch: (value: Action) => void,
  user: AuthState['user'],
  callback: Function, date: CalendarEntry
) => new Promise<void>((success,fail) => {
  if (user) {
    SetDate(user, date).then(d => {
      if (d) {
        dispatch(SetDateAction(d));
        callback();
        success();
      } else {
        fail()
      }
    })
  } else {
    fail()
  }
})

export type CalendarState = {
  dates: CalendarRecord
}

export const initialState: CalendarState = {
  dates: {
    window: {
      starts: new Date(0),
      ends: new Date(0)
    },
    items: new Array<CalendarEntry>()
  }
}

export default function CalendarReducer(
  prevState = initialState['dates'],
  action: Action
): CalendarState['dates'] {
  switch (action.type) {
    case GET_DATES: // TODO: make this an array of CalendarRecords so we can get chunks of data rather than one contigious window
      return {
        ...prevState,
        ...action.dates
      };
    default:
      return prevState
  }
};
