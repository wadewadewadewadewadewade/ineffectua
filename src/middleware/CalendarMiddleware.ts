import { State } from './../Types';
import { GetDatesAction, ReplaceDatesAction, CalendarState } from './../reducers/CalendarReducer';
import { Action, isFetching } from './../reducers';
import { CalendarEntry } from '../Types';
import { CustomMarking } from 'react-native-calendars';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

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
      const r = new Array<string>();
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

export const datesToArray = (dates: CalendarState['dates'], oldest?: Date, newest?: Date): Array<CalendarEntry> => {
  const response = new Array<CalendarEntry>();
  const keys = Object.keys(dates);
  for(let i = 0;i<keys.length;i++) {
    const date = dates[keys[i]];
    const { starts } = date.window;
    if ((oldest && newest && (starts >= oldest && starts < newest)) || !(oldest && newest))  {
      response.push(date)
    }
  }
  return response
}

export const formatDates = (dates: CalendarState['dates']): AgendaDate => {
  const response: AgendaDate = {};
  const keys: Array<string> = Object.keys(dates);
  for(let i = 0;i<keys.length;i++) {
    const date = dates[keys[i]];
    const { starts, ends } = date.window;
    const duration = dateDiff(ends, starts);
    const m = starts.getMonth() + 1;
    const d = starts.getDate();
    const isoDate = starts.getFullYear() + '-' + (m < 10 ? '0' + m.toString() : m.toString()) + '-' + (d < 10 ? '0' + d.toString() :d.toString());
    if (!response[isoDate]) {
      response[isoDate] = new Array<AgendaItem>()
    }
    response[isoDate].push({
      name: date.title + ' - ' + duration
    })
  }
  return response;
}

export const formatDatesForMarking = (dates: CalendarState['dates'], oldest?: Date, newest?: Date): AgendaDateMarking => {
  const response: AgendaDateMarking = {};
  const keys = Object.keys(dates);
  for(let i = 0;i<keys.length;i++) {
    const date = dates[keys[i]];
    const { starts } = date.window;
    if ((oldest && newest && (starts >= oldest && starts < newest)) || !(oldest && newest))  {
      const m = starts.getMonth() + 1;
      const d = starts.getDate();
      const isoDate = starts.getFullYear() + '-' + (m < 10 ? '0' + m.toString() : m.toString()) + '-' + (d < 10 ? '0' + d.toString() :d.toString());
      response[isoDate] = {
        customStyles: {
          container: { backgroundColor: 'rgba(255,0,0,0.5)'},
          text: { color: '#fff'}
        }
      }
    }
  }
  return response;
}

const convertDocumentDataToCalendarEntry = (data: firebase.firestore.DocumentData): CalendarEntry => {
  const doc = data.data()
  return {
    key: data.id,
    window: {
      starts: new Date(doc.window.starts.seconds * 1000),
      ends: new Date(doc.window.ends.seconds * 1000)
    },
    title: doc.title,
    description: doc.description,
    contacts: doc.contacts
  }
}

export const getDates = (): ThunkAction<Promise<void>, State, {}, Action> => {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: any): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firebase.firestore.setLogLevel('debug');
        dispatch(isFetching(true))
        firebase.firestore().collection('users')
          .doc(user.uid).collection('calendar')
          .orderBy('window.starts')
          .get()
          .then((querySnapshot: firebase.firestore.QuerySnapshot) => {
            const dates: CalendarState['dates'] = {};
            const arr = querySnapshot.docs.map(d => {
              const val = convertDocumentDataToCalendarEntry(d);
              return val
            })
            arr.forEach(d => { if (d.key) dates[d.key] = d })
            dispatch(GetDatesAction(dates))
            dispatch(isFetching(false))
            resolve()
          })
      }
    })
  }
}

export const watchDates = (): ThunkAction<Promise<void>, State, {}, Action> => {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: any): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firestore.setLogLevel('debug');
        firebase.firestore()
          .collection('users')
          .doc(user.uid)
          .collection('calendar')
          .orderBy('window.starts')
          .onSnapshot((documentSnapshot: firebase.firestore.QuerySnapshot) => {
            const dates: CalendarState['dates'] = {};
            const arr = documentSnapshot.docs.map(d => {
              const val = convertDocumentDataToCalendarEntry(d);
              return val
            })
            arr.forEach(d => { if (d.key) dates[d.key] = d })
            dispatch(ReplaceDatesAction(dates));
          });
      }
    })
  }
}

export const addDates = (date: CalendarEntry, onComplete?: () => void): ThunkAction<Promise<void>, State, {}, Action> => {
  return async (dispatch: ThunkDispatch<State, {}, Action>, getState: () => State, firebase: any): Promise<void> => {
    return new Promise<void>((resolve) => {
      const { user } = getState();
      if (user) {
        //firebase.firestore.setLogLevel('debug');
        dispatch(isFetching(true))
        if (date.key) {
          // its an update
          firebase.firestore().collection('users')
            .doc(user.uid).collection('calendar')
            .update(date.key, date)
            .then(() => {
              const dates: CalendarState['dates'] = {date};
              dispatch(GetDatesAction(dates))
              dispatch(isFetching(true))
              onComplete && onComplete()
          })
        } else {
          // it's a new record
          firebase.firestore().collection('users')
            .doc(user.uid).collection('calendar')
            .add(date)
            .then((d: firebase.firestore.QuerySnapshot) => {
              const dates: CalendarState['dates'] = {date}
              dates.key = d.docs[0].data().id;
              dispatch(GetDatesAction(dates))
              dispatch(isFetching(true))
              onComplete && onComplete()
            })
        }
      }
    })
  }
}
