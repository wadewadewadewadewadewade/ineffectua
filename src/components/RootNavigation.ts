import { RootStackParamList } from './../Types';
import { NavigationContainerRef, RouteProp, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import {PostCriteriaKey} from './../reducers/PostsReducer';
import * as React from 'react';
import {DateObject} from 'react-native-calendars';

const RootScreenNames = ['Profile'];
const TabScreenNames = [
  'Agenda',
  'Calendar',
  'Contacts',
  'Medications',
  'PainLog',
];

export const navigationRef = React.createRef<NavigationContainerRef>();

type NavigationParams = {
  key?: PostCriteriaKey; // Agenda Posts
  date?: DateObject; // Calendar
  user?: {userId: string}; // Profile
};

export function navigate(
  name: string,
  params?: NavigationParams,
  title?: string,
) {
  if (RootScreenNames.includes(name)) {
    navigationRef.current?.navigate(name, {...params, title});
  } else if (TabScreenNames.includes(name)) {
    navigationRef.current?.navigate('Tabs', {
      screen: name,
      params: {...params, title},
    });
  } else {
    navigationRef.current?.navigate('Root', {
      screen: name,
      params: {...params, title},
    });
  }
}

export function getRouteParams() {
  return navigationRef.current?.getCurrentRoute()?.params as NavigationParams;
}

export function getHeaderTitle(
  options: Record<string, any> | undefined,
  route:
    | Readonly<{
        key: string;
        name: string;
        params?: object;
      }>
    | undefined,
  savedStateName?: string,
): string {
  // If the focused route is not found, we need to assume it's the initial screen
  // This can happen during if there hasn't been any navigation inside the screen
  // In our case, it's "Feed" as that's the first screen inside the navigator
  let routeName =
    savedStateName ||
    (options && options.title) ||
    (route && (getFocusedRouteNameFromRoute(route) || route.name));
  switch (routeName) {
    case 'ModalScreen':
      return ((route as RouteProp<RootStackParamList, 'Tabs'>)?.params as any)
        .title;
    case 'Tabs':
    case 'Agenda':
    case 'Feed':
      const agendaParams = (route?.params as RootStackParamList['Tabs']['Agenda']);
      return agendaParams && agendaParams.title || 'Agenda';
    case 'CalendarEntry':
      const calendarDayParams = (route?.params as RootStackParamList['Tabs']['Calendar']['CalendarDay']);
      return calendarDayParams && calendarDayParams.title || calendarDayParams.date.dateString;
    case 'Calendar':
      return 'Calendar';
    case 'PainLogEntry':
    case 'PainLog':
      return 'Pain Log';
    case 'Profile':
      const profileParams = (route?.params as RootStackParamList['Tabs']['Agenda']);
      return profileParams && profileParams.title || 'Profile';
    case 'Contacts':
      const contactsParams = (route?.params as RootStackParamList['Tabs']['Agenda']);
      return contactsParams && contactsParams.title || 'Contacts';
    case 'Account':
      return 'My Account';
  }
  return routeName;
}
