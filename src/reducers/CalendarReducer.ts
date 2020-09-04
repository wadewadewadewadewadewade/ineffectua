import { CalendarEntry } from '../Types';

export const GET_DATES= 'GET_DATES';
export const SET_DATES= 'SET_DATES';
export const REPLACE_DATES= 'REPLACE_DATES';

export type Action = {
    type: 'SET_DATES';
    dates: CalendarState['dates']
  } | {
    type: 'GET_DATES';
    dates: CalendarState['dates']
  } | {
    type: 'REPLACE_DATES';
    dates: CalendarState['dates']
  };

export const GetDatesAction = (dates: CalendarState['dates']): Action => ({
  type: GET_DATES,
  dates
});

export const SetDatesAction = (dates: CalendarState['dates']): Action => ({
  type: SET_DATES,
  dates
});

export const ReplaceDatesAction = (dates: CalendarState['dates']): Action => ({
  type: SET_DATES,
  dates
});

export type CalendarState = {
  dates: {
    [id: string]: CalendarEntry
  }
}

export const initialState = {};

export default function CalendarReducer(
  prevState = initialState,
  action: Action
): CalendarState['dates'] {
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
