import { CalendarEntry, CalendarRecord } from '../Types';

export const GET_DATES= 'GET_DATES';
export const SET_DATES= 'SET_DATES';
export const REPLACE_DATES= 'SET_DATES';

export type Action = {
    type: 'SET_DATES';
    dates: CalendarRecord['items']
  } | {
    type: 'GET_DATES';
    dates: CalendarRecord['items']
  } | {
    type: 'REPLACE_DATES';
    dates: CalendarRecord['items']
  };

export const GetDatesAction = (dates: CalendarRecord['items']): Action => ({
  type: GET_DATES,
  dates
});

export const SetDatesAction = (dates: CalendarRecord['items']): Action => ({
  type: SET_DATES,
  dates
});

export const ReplaceDatesAction = (dates: CalendarRecord['items']): Action => ({
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
  if (!action.dates) {
    return prevState
  }
  switch (action.type) {
    case GET_DATES:
      return {
        ...prevState,
        ...action.dates
      };
    case SET_DATES:
      return {
        ...prevState,
        items: [
          ...prevState.items,
          ...action.dates
        ]
      };
    case REPLACE_DATES:
      return {
        window: prevState.window,
        items: action.dates
      };
    default:
      return prevState
  }
}
