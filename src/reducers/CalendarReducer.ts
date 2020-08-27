import { CalendarEntry, CalendarRecord } from '../Types';

export const GET_DATES= 'GET_DATES';
export const SET_DATES= 'SET_DATES';

export type Action = {
    type: 'SET_DATES';
    dates: CalendarRecord['items']
  } | {
    type: 'GET_DATES';
    dates: CalendarRecord
  };

export const GetDatesAction = (dates: CalendarRecord): Action => ({
  type: GET_DATES,
  dates
});

export const SetDatesAction = (dates: CalendarRecord['items']): Action => ({
  type: SET_DATES,
  dates
});

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
