import { NavigationContainerRef } from '@react-navigation/native';
import { PostCriteriaKey } from './../reducers/PostsReducer';
import * as React from 'react';
import { DateObject } from 'react-native-calendars';

export const navigationRef = React.createRef<NavigationContainerRef>();

type NavigationParams = {
  key?: PostCriteriaKey, // Agenda Posts
  date?: DateObject, // Calendar
  user?: {userId: string}, // Profile
}

export function navigate(name: string, params: NavigationParams, title?: string) {
  navigationRef.current?.navigate(name, {...params, title});
}

export function getRouteParams() {
  return navigationRef.current?.getCurrentRoute()?.params as NavigationParams;
}