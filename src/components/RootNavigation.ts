import {NavigationContainerRef} from '@react-navigation/native';
import * as React from 'react';
import {DateObject} from 'react-native-calendars';

//const RootScreenNames = ['Profile'];
const TabScreenNames = [
  'Agenda',
  'Calendar',
  'Contacts',
  'Medications',
  'PainLog',
];
const AgendaScreenNames = ['Agenda', 'Posts', 'Post'];

export const navigationRef = React.createRef<NavigationContainerRef>();

export type NavigationParams = {
  type?: string; // Agenda Posts
  id?: string; // Agenda Posts
  date?: DateObject; // Calendar
  user?: {userId: string}; // Profile
};

export function navigate(
  name: string,
  params?: NavigationParams,
  title?: string,
) {
  if (navigationRef.current !== null) {
    if (TabScreenNames.includes(name)) {
      const destination = {
        key: undefined as string | undefined,
        screen: name,
        params: {...params, title},
      };
      if (AgendaScreenNames.includes(name)) {
        navigationRef.current.navigate('Agenda', destination);
      } else {
        /*const route = navigationRef.current.getCurrentRoute();
        if (route?.key.startsWith(name)) {
          destination.key = route?.key;
        }*/
        navigationRef.current.navigate('Tabs', destination);
      }
    } else {
      navigationRef.current?.navigate(name, params);
    }
  }
}

/*export function getRouteParams() {
  //console.log(navigationRef.current?.getCurrentRoute());
  return navigationRef.current?.getCurrentRoute()?.params as NavigationParams;
}*/

type TitleType = {
  title: string;
  headerTitle: string;
};

export const formatTitle = (options: Record<string, any> | undefined) => {
  const title: TitleType = {title: 'Agenda', headerTitle: 'Agenda'};
  //console.log({options});
  if (options !== undefined) {
    if ('title' in options) {
      // AuthFlow
      title.title = options.title;
      title.headerTitle = options.title;
    } else if ('tabBarLabel' in options) {
      // Tabs screens
      title.title = options.tabBarLabel;
      title.headerTitle = options.tabBarLabel;
    } else if ('type' in options && 'id' in options) {
      const {type, id} = options;
      if (type === 'tags') {
        title.title = `#${id}`;
        title.headerTitle = `#${id}`;
      }
    }
  }
  return title;
};

/*const getRouteParamsAsObject = (
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
  | 'Posts'
  | 'SignIn'
  | 'AuthenticationSuccess'
  | 'Profile'
  | 'Calendar'
  | 'CalendarDay'
  | 'Contacts'
  | 'Medications'
  | 'PainLog'
  | 'NotFound'
  | 'Tabs'
  | undefined;

export function getHeaderTitle(
  savedStateName?: RouteNames,
): string | undefined {
  const route = navigationRef.current?.getCurrentRoute();
  const routeName: RouteNames | undefined =
    savedStateName ||
    (route &&
      ((getFocusedRouteNameFromRoute(route) || route.name) as RouteNames)) ||
    'Agenda';

  const params = (route && getRouteParamsAsObject(route.params)) || {
    title: undefined,
  };
  console.log({route, savedStateName, routeName});
  switch (routeName) {
    case 'AuthenticationSuccess':
      return 'Authentication Success';
    case 'SignIn':
      // We don't show the header bar on any of the Auth pages, so when it does appear...
      return 'Agenda';
    case 'Tabs':
      return 'Agenda';
    case 'Posts':
      return params.type === 'tags' ? `#${params.id}` : 'Posts';
    case 'CalendarDay':
    case 'Calendar':
      return (params && (params.title || params.date?.dateString)) || routeName;
    case 'NotFound':
      return 'Not Found';
    default:
      return (params && params.title) || routeName;
  }
}*/
