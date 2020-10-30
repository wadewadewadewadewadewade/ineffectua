import React from 'react';
import CalendarDay, {CalendarDayProps} from './CalendarDay';
import {createStackNavigator} from '@react-navigation/stack';
import Calendar from './Calendar';
import {GeneralNavigationParams} from '../../Types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export type CalendarStackParamList = {
  Calendar: undefined;
  CalendarDay: GeneralNavigationParams & CalendarDayProps;
  NotFound: undefined;
};

const CalendarNavigation = () => {
  const navigation = useNavigation();
  useFocusEffect(() => {
    navigation.dangerouslyGetParent()?.setOptions({headerTitle: 'Calendar'});
  });
  const Stack = createStackNavigator<CalendarStackParamList>();
  return (
    <Stack.Navigator initialRouteName="Calendar">
      <Stack.Screen name="Calendar" component={Calendar} />
      <Stack.Screen name="CalendarDay" component={CalendarDay} />
    </Stack.Navigator>
  );
};

export default CalendarNavigation;
