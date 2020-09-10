import * as React from 'react';
import { StyleSheet } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import PainLogEntry from './shared/PainLogEntry';
import ContactsList from './Contacts/ContactsList';
import Agenda from './shared/Agenda';
import CalendarNavigator, { CalendarStackParamList } from './calendar/CalendarNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MedicationsList from './Medications/MedicationsList';
import { contrast } from '../middleware/DataTypesMiddleware';

export type MaterialBottomTabParams = {
  Agenda: undefined;
  Calendar: CalendarStackParamList;
  PainLogEntry: undefined;
  ContactsList: undefined;
  MedicationsList: undefined;
};

const MaterialBottomTabs = createMaterialBottomTabNavigator<
  MaterialBottomTabParams
>();

export default function MaterialBottomTabsScreen() {
  const colors = new Array<string>()
  for(let i=0;i<5;i++) {
    let color = Math.floor(Math.random()*16777215).toString(16)
    if (color.length < 6) {
      color = '0'.repeat(6 - color.length) + color
    }
    colors.push('#' + color)
  }
  return (
    <MaterialBottomTabs.Navigator
      labeled={false}
      barStyle={styles.tabBar}
    >
      <MaterialBottomTabs.Screen
        name="Agenda"
        component={Agenda}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={contrast(color)} size={26} />
          ),
          tabBarColor: colors[0],
        }}
      />
      <MaterialBottomTabs.Screen
        name="Calendar"
        component={CalendarNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar" color={contrast(color)} size={26} />
          ),
          tabBarColor: colors[1],
        }}
      />
      <MaterialBottomTabs.Screen
        name="ContactsList"
        component={ContactsList}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="contacts" color={contrast(color)} size={26} />
          ),
          tabBarColor: colors[2],
        }}
      />
      <MaterialBottomTabs.Screen
        name="MedicationsList"
        component={MedicationsList}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="pill" color={contrast(color)} size={26} />
          ),
          tabBarColor: colors[3],
        }}
      />
      <MaterialBottomTabs.Screen
        name="PainLogEntry"
        component={PainLogEntry}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="human" color={contrast(color)} size={26} />
          ),
          tabBarColor: colors[4],
        }}
      />
    </MaterialBottomTabs.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
  },
  tabBarLabel: {
    paddingBottom: 6,
    fontSize: 10,
    textAlign: 'center'
  },
  tabBarLabelActive: {
    color: 'red'
  }
});
