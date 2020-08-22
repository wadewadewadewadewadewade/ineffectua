import React from 'react';
import CalendarEntry, { CalendarEntryProps } from '../shared/CalendarEntry';
import { createStackNavigator } from '@react-navigation/stack';
import Calendar from './Calendar';

export type CalendarStackParamList = {
  Calendar: undefined;
  CalendarEntry: CalendarEntryProps;
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
        name="CalendarEntry"
        component={CalendarEntry}
      />
    </Stack.Navigator>
  )
}

export default CalendarNavigation;
