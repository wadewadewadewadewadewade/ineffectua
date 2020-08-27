import { State } from './../Types';
import { SetDatesAction } from './../reducers/CalendarReducer';
import { Action } from './../reducers';
import { AuthState } from '../reducers/AuthReducer';
import { firebase } from '../firebase/config';
import { User } from 'firebase';
import { CalendarWindow, CalendarEntry, CalendarRecord } from '../Types';
import { CustomMarking } from 'react-native-calendars';

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

/*export async function GetDates(
  user: User,
  window?: CalendarWindow,
): Promise<CalendarRecord> {
  if (!window) {
    window = {
      starts: new Date(Date.now()),
      ends: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  }
  //firebase.firestore.setLogLevel('debug');
  let dates: void | Array<CalendarEntry> = await firebase.firestore().collection('users')
    .doc(user.uid).collection('calendar')
    .where('start', '>=', window.starts).where('start', '<=', window.ends)
    .orderBy('start')
    .get()
    .then((querySnapshot) =>
      (querySnapshot.docs.map(d => d.data() as CalendarEntry))
    )
  if (!dates) {
    dates = new Array<CalendarEntry>();
  }
  return {
    window: window,
    items: dates
  };
}*/

export function watchDates(dispatch: (action: Action) => void, state: State): () => void {
  const { user, dates } = state;
  if (user) {
    //firestore.setLogLevel('debug');
    const subscriber = firebase.firestore()
      .collection('users')
      .doc(user.uid)
      .collection('calendar')
      .onSnapshot(documentSnapshot => {
        dispatch(
          SetDatesAction(
            Object.assign(dates, documentSnapshot.docs.map(snap => snap.data() as CalendarEntry)
          )
        ));
      });
    // Stop listening for updates when no longer required
    return () => subscriber();
  }
  return () => {}
}

export async function addDate(
  user: User,
  date: CalendarEntry,
): Promise<CalendarEntry | undefined> {
  firebase.firestore.setLogLevel('debug');
  return await firebase.firestore().collection('users')
    .doc(user.uid).collection('calendar')
    .add(date)
    .then(snap => snap.get().then(doc => doc.data() as CalendarEntry));
}
