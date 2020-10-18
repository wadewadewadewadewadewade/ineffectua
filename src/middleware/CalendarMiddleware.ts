import {
  CalendarState,
  CalendarWindow,
  CalendarType,
} from './../reducers/CalendarReducer';
import {CalendarEntry} from '../reducers/CalendarReducer';
import {CalendarDot, MultiDotMarking} from 'react-native-calendars';
import {DataTypesState} from '../reducers/DataTypesReducer';
import {getFirebaseDataWithUser, setFirebaseDataWithUser} from './Utilities';
import {User} from '../reducers/AuthReducer';

/*===== formatting tool ====*/
type AgendaItem = {
  name: string;
  height?: number;
};

type AgendaDate = {
  [isoDate: string]: Array<AgendaItem>;
};

type AgendaDateMarking = {
  [isoDate: string]: MultiDotMarking;
};

type DateSpan = {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  toString: () => string;
};

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
        r.push(response.years.toString() + ' years');
      }
      if (response.days > 0) {
        r.push(response.days.toString() + ' days');
      }
      if (response.hours > 0) {
        r.push(response.hours.toString() + ' hours');
      }
      if (response.minutes > 0) {
        r.push(response.minutes.toString() + ' minutes');
      }
      return r.join(', ');
    },
  };
  if (response.years > 0) {
    span = span - response.years * _MS_PER_DAY * 365;
  }
  response.days = Math.floor(span / _MS_PER_DAY);
  if (response.days > 0) {
    span = span - response.days * _MS_PER_DAY;
  }
  response.hours = Math.floor(span / (_MS_PER_DAY / 24));
  if (response.hours > 0) {
    span = span - response.hours * (_MS_PER_DAY / 24);
  }
  response.minutes = Math.floor(span / (_MS_PER_DAY / (24 * 60)));
  return response.toString();
}

export const addDays = function (date: Date, days: number) {
  date.setDate(date.getDate() + days);
  return date;
};

export const datesToArray = (
  dates: CalendarState['dates'],
  oldest?: Date,
  newest?: Date,
): Array<CalendarEntry> => {
  const response = new Array<CalendarEntry>();
  if (dates) {
    const keys = Object.keys(dates);
    for (let i = 0; i < keys.length; i++) {
      const date = dates[keys[i]];
      const {starts} = date.window;
      if (
        (oldest && newest && starts >= oldest && starts < newest) ||
        !(oldest && newest)
      ) {
        response.push(date);
      }
    }
  }
  return response;
};

export const formatDates = (dates: CalendarState['dates']): AgendaDate => {
  const response: AgendaDate = {};
  const keys: Array<string> = Object.keys(dates);
  for (let i = 0; i < keys.length; i++) {
    const date = dates[keys[i]];
    const {starts, ends} = date.window;
    const duration = dateDiff(ends, starts);
    const m = starts.getMonth() + 1;
    const d = starts.getDate();
    const isoDate =
      starts.getFullYear() +
      '-' +
      (m < 10 ? '0' + m.toString() : m.toString()) +
      '-' +
      (d < 10 ? '0' + d.toString() : d.toString());
    if (!response[isoDate]) {
      response[isoDate] = new Array<AgendaItem>();
    }
    response[isoDate].push({
      name: date.title + ' - ' + duration,
    });
  }
  return response;
};

export const formatDatesForMarking = (
  dates: CalendarState['dates'],
  datatypes: DataTypesState['datatypes'],
  oldest?: Date,
  newest?: Date,
): AgendaDateMarking => {
  const response: AgendaDateMarking = {};
  const keys = Object.keys(dates);
  for (let i = 0; i < keys.length; i++) {
    const date = dates[keys[i]];
    const datatype = date.typeId ? datatypes[date.typeId] : undefined;
    const {starts} = date.window;
    if (
      (oldest && newest && starts >= oldest && starts < newest) ||
      !(oldest && newest)
    ) {
      const m = starts.getMonth() + 1;
      const d = starts.getDate();
      const isoDate =
        starts.getFullYear() +
        '-' +
        (m < 10 ? '0' + m.toString() : m.toString()) +
        '-' +
        (d < 10 ? '0' + d.toString() : d.toString());
      const dot: CalendarDot = {
        key: datatype && datatype.key ? datatype.key : 'default-' + i,
        color: datatype ? datatype.color : '#600',
      };
      response[isoDate]
        ? response[isoDate].dots.push(dot)
        : (response[isoDate] = {dots: [dot]});
    }
  }
  return response;
};

export const formatTime = (d: Date) => {
  const hour = d.getHours() > 12 ? d.getHours() - 12 : d.getHours(),
    minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes(),
    meridian = d.getHours() > 12 ? 'pm' : 'am';
  return `${hour}:${minutes}${meridian}`;
};

export const formatDateAndTime = (d: Date) => {
  const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    month = months[d.getMonth()],
    dayNumber = d.getDate(),
    day = days[d.getDay()],
    hour = d.getHours() > 12 ? d.getHours() - 12 : d.getHours(),
    minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes(),
    meridian = d.getHours() > 12 ? 'pm' : 'am';
  return `${day} ${month} ${dayNumber}, ${hour}:${minutes}${meridian}`;
};

export const formatDateConditionally = (d: Date) => {
  const today = new Date();
  if (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  ) {
    return formatTime(d);
  } else {
    return formatDateAndTime(d);
  }
};

export const dateInDateWindow = (
  date: CalendarEntry,
  window: CalendarWindow,
) => {
  // check if date ends before window ends and date ends after window starts (end within window)
  if (date.window.ends < window.ends && date.window.ends > window.starts) {
    return true;
  }
  // then check if date starts after window starts and date starts before window ends (starts within window)
  if (date.window.starts > window.starts && date.window.starts < window.ends) {
    return true;
  }
  // finally, check if date starts before window starts and date ends after window ends (exlipses window)
  if (date.window.starts < window.starts && date.window.ends > window.ends) {
    return true;
  }
  return false;
};

/*const convertDocumentDataToCalendarEntry = (
  data: firebase.firestore.DocumentData,
): CalendarEntry => {
  const doc = data.data();
  return {
    key: data.id,
    typeId: doc.typeId,
    window: {
      starts: new Date(doc.window.starts.seconds * 1000),
      ends: new Date(doc.window.ends.seconds * 1000),
    },
    title: doc.title,
    description: doc.description,
    contacts: doc.contacts,
  };
};*/

export const getDates = (user: User): Promise<CalendarType> => {
  return getFirebaseDataWithUser<CalendarType>(user, 'users/calendar').then(
    (c) => {
      for (let key in Object.keys(c)) {
        c[key].window.starts = new Date(c[key].window.starts);
        c[key].window.ends = new Date(c[key].window.ends);
      }
      return c;
    },
  );
};

export const addDate = (
  user: User,
  date: CalendarEntry,
): Promise<CalendarEntry> => {
  return setFirebaseDataWithUser<CalendarEntry>(
    user,
    'users/calendar',
    date,
  ).then((d) => {
    d.window.starts = new Date(d.window.starts);
    d.window.ends = new Date(d.window.ends);
    return d;
  });
};
