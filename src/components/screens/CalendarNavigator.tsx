import React from 'react';
import CalendarEntry, { CalendarEntryProps } from '../shared/CalendarEntry';
import { createStackNavigator } from '@react-navigation/stack';
import Calendar from './Calendar';

export type CalendarStackParamList = {
  CalendarEntry: CalendarEntryProps;
  Calendar: undefined;
  NotFound: undefined;
};

const CalendarNavigation = () => {
  
  const Stack = createStackNavigator<CalendarStackParamList>();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Calendar"
        options={({route}) => ({ title: route.params && (route.params as any).title })}
        component={Calendar}
      />
      <Stack.Screen
        name="CalendarEntry"
        options={({route}) => ({ title: route.params && (route.params as any).title })}
        component={CalendarEntry}
      />
    </Stack.Navigator>
  )
}

export default CalendarNavigation;
