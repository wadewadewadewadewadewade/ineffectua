import React from 'react';
import CalendarEntryItem, { CalendarEntryProps } from '../shared/CalendarEntryItem';
import { createStackNavigator } from '@react-navigation/stack';
import Calendar from './Calendar';

export type CalendarStackParamList = {
  Calendar: undefined;
  CalendarEntryItem: CalendarEntryProps;
  NotFound: undefined;
};

const CalendarNavigation = () => {
  
  const Stack = createStackNavigator<CalendarStackParamList>();
  return (
    <Stack.Navigator initialRouteName="Calendar">
      <Stack.Screen
        name="Calendar"
        component={Calendar}
      />
      <Stack.Screen
        name="CalendarEntryItem"
        component={CalendarEntryItem}
      />
    </Stack.Navigator>
  )
}

export default CalendarNavigation;
