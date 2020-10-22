import {NavigationContainerRef} from '@react-navigation/native';
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
      props: {...params, title},
    });
  } else {
    navigationRef.current?.navigate('Root', {
      screen: name,
      props: {...params, title},
    });
  }
}

export function getRouteParams() {
  return navigationRef.current?.getCurrentRoute()?.params as NavigationParams;
}
