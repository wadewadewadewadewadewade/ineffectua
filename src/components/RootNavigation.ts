import {GeneralNavigationParams} from './../Types';
import {
  NavigationContainerRef,
  getFocusedRouteNameFromRoute,
  CommonActions,
} from '@react-navigation/native';
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
  if (TabScreenNames.includes(name)) {
    navigationRef.current?.navigate('Tabs', {
      screen: name,
      params: {...params, title},
    });
  } else {
    navigationRef.current?.navigate(name, params);
  }
}

export function getRouteParams() {
  return navigationRef.current?.getCurrentRoute()?.params as NavigationParams;
}

const getRouteParamsAsObject = (
  params: object | undefined,
): (GeneralNavigationParams & NavigationParams) | undefined => {
  if (params !== undefined && 'params' in params) {
    return (params as any).params;
  } else if (params !== undefined) {
    return params;
  } else {
    return undefined;
  }
};

type RouteNames =
  | 'Agenda'
  | 'AuthFlow'
  | 'Profile'
  | 'Calendar'
  | 'CalendarDay'
  | 'Contacts'
  | 'Medications'
  | 'PainLog'
  | 'NotFound'
  | undefined;

export function getHeaderTitle(
  options: Record<string, any> | undefined,
  route:
    | Readonly<{
        key: string;
        name: string;
        params?: object;
      }>
    | undefined,
  savedStateName?: RouteNames,
): string {
  // If the focused route is not found, we need to assume it's the initial screen
  // This can happen during if there hasn't been any navigation inside the screen
  // In our case, it's "Feed" as that's the first screen inside the navigator
  const routeName: RouteNames | undefined =
    savedStateName ||
    (route &&
      ((getFocusedRouteNameFromRoute(route) || route.name) as RouteNames));

  const params = (route && getRouteParamsAsObject(route.params)) || {
    title: undefined,
  };
  switch (routeName) {
    case 'CalendarDay':
    case 'Calendar':
      return (params && (params.title || params.date?.dateString)) || routeName;
    default:
      return (params && params.title) || routeName || '';
  }
}
