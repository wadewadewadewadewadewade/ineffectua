import { firestore } from 'firebase';

type CalendarRecord = {
  window: {
    starts: Date,
    ends: Date
  }
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
    windowStart: Date = new Date(Date.now()),
    windowEnd: Date = windowStart && new Date(windowStart.getTime() + 1000 * 60 * 60 * 24) || new Date(Date.now() + 1000 * 60 * 60 * 24)
  ): Promise<CalendarRecord> {
    let dates: void | Array<CalendarEntryType> = await firestore().collection('users/' + user.uid + '/calendar')
      .where('start', '>=', windowStart).where('start', '<=', windowEnd)
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
      window: {
        starts: windowStart,
        ends: windowEnd
      },
      items: dates
    };
  }

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
