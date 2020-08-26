import React from 'react';
import CalendarDay, { CalendarDayProps } from './CalendarDay';
import { createStackNavigator } from '@react-navigation/stack';
import Calendar from './Calendar';

export type CalendarStackParamList = {
  Calendar: undefined;
  CalendarDay: CalendarDayProps;
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
        name="CalendarDay"
        component={CalendarDay}
      />
    </Stack.Navigator>
  )
}

export default CalendarNavigation;
