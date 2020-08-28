import { CalendarEntry } from '../Types';

export const GET_DATES= 'GET_DATES';
export const SET_DATES= 'SET_DATES';
export const REPLACE_DATES= 'SET_DATES';

export type Action = {
    type: 'SET_DATES';
    dates: Array<CalendarEntry>
  } | {
    type: 'GET_DATES';
    dates: Array<CalendarEntry>
  } | {
    type: 'REPLACE_DATES';
    dates: Array<CalendarEntry>
  };

export const GetDatesAction = (dates: Array<CalendarEntry>): Action => ({
  type: GET_DATES,
  dates
});

export const SetDatesAction = (dates: Array<CalendarEntry>): Action => ({
  type: SET_DATES,
  dates
});

export const ReplaceDatesAction = (dates: Array<CalendarEntry>): Action => ({
  type: SET_DATES,
  dates
});

export type CalendarState = {
  dates: Array<CalendarEntry>
}

export const initialState = new Array<CalendarEntry>();

export default function CalendarReducer(
  prevState = initialState,
  action: Action
): Array<CalendarEntry> {
  if (!action.dates) {
    return prevState
  }
  switch (action.type) {
    case GET_DATES:
    case SET_DATES:
      return {
        ...prevState,
        ...action.dates
      };
    case REPLACE_DATES:
      return action.dates;
    default:
      return prevState
  }
}
