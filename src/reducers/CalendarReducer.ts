import { firestore } from 'firebase';
import { CustomMarking } from 'react-native-calendars';
import { AuthState } from './AuthReducer';

export type CalendarWindow = {
  starts: Date,
  ends: Date
}

type CalendarRecord = {
  window: CalendarWindow
  items: Array<CalendarEntryType>
}

interface CalendarEntry {
  starts: Date,
  ends: Date,
  title: string,
  description: string | undefined,
  contacts: Array<string> | undefined
}

export class CalendarEntryType implements CalendarEntry {
  starts: Date = new Date();
  ends: Date = new Date();
  title: string = '';
  description: string | undefined;
  contacts: Array<string> | undefined;
  constructor (starts: Date, ends: Date, title: string, description?: string, contacts?: Array<string>) {
    const keys: Array<string> = Object.keys(arguments);
    this.starts = starts;
    this.ends = ends;
    this.title = title;
    this.description = description;
    this.contacts = contacts;
  }
}

// Firestore data converter
export const calendarTypeEntryConverter = {
  toFirestore: function(date: CalendarEntryType) {
    return date
  },
  fromFirestore: function(snapshot: firestore.QueryDocumentSnapshot<firestore.DocumentData>, options: any){
    const data = snapshot.data(options);
    return new CalendarEntryType(data.starts, data.ends, data.title, data.description, data.contacts)
  }
}

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

export const formatDates = (dates: Array<CalendarEntryType>): AgendaDate => {
  const response: AgendaDate = {};
  dates.forEach(date => {
    const m = date.starts.getMonth();
    const d = date.starts.getDay();
    const isoDate = date.starts.getFullYear() + '-' + (m < 10 ? '0' + m.toString() : m.toString()) + '-' + (d < 10 ? '0' + d.toString() :d.toString());
    const duration = dateDiff(date.ends, date.starts)
    if (!response[isoDate]) {
      response[isoDate] = new Array<AgendaItem>()
    }
    response[isoDate].push({
      name: date.title + ' - ' + duration
    })
  })
  return response;
}

export const formatDatesForMarking = (dates: Array<CalendarEntryType>): AgendaDateMarking => {
  const response: AgendaDateMarking = {};
  dates.forEach(date => {
    const m = date.starts.getMonth();
    const d = date.starts.getDay();
    const isoDate = date.starts.getFullYear() + '-' + (m < 10 ? '0' + m.toString() : m.toString()) + '-' + (d < 10 ? '0' + d.toString() :d.toString());
    response[isoDate].customStyles = {
      container: { backgroundColor: 'rgba(255,0,0,0.5)'},
      text: { color: '#fff'}
    }
  })
  return response;
}

export const GET_DATES= 'GET_DATES';

export type Action =
  | {
    type: 'GET_DATES';
    dates: CalendarRecord
  };

export const GetDatesAction = (dates: CalendarRecord): Action => ({
  type: GET_DATES,
  dates
});

export async function GetDates(
    user: firebase.User,
    window?: CalendarWindow,
  ): Promise<CalendarRecord> {
    if (!window) {
      window = {
        starts: new Date(Date.now()),
        ends: new Date(Date.now() + 1000 * 60 * 60 * 24)
      }
    }
    //firestore.setLogLevel('debug');
    let dates: void | Array<CalendarEntryType> = await firestore().collection('users/' + user.uid + '/calendar')
      .where('start', '>=', window.starts).where('start', '<=', window.ends)
      .orderBy('start')
      .withConverter(calendarTypeEntryConverter)
      .get()
      .then((querySnapshot) => {
        (querySnapshot.docs.map(d => d.data()))
      })
    if (!dates) {
      dates = new Array<CalendarEntryType>();
    }
    return {
      window: window,
      items: dates
    };
  }

export const getDates = (dispatch: (value: Action) => void, user: AuthState['user'], callback: Function, window?: CalendarWindow,) => new Promise<void>((success,fail) => {
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

export type CalendarState = {
  dates: CalendarRecord
}

export const initialState: CalendarState = {
  dates: {
    window: {
      starts: new Date(0),
      ends: new Date(0)
    },
    items: new Array<CalendarEntryType>()
  }
}

export default function CalendarReducer(prevState = initialState['dates'], action: Action): CalendarState['dates'] {
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
