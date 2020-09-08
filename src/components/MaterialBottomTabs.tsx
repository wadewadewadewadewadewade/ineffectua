import * as React from 'react';
import { StyleSheet } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import PainLogEntry from './shared/PainLogEntry';
import ContactList from './Contacts/ContactList';
import Agenda from './shared/Agenda';
import CalendarNavigator, { CalendarStackParamList } from './calendar/CalendarNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type MaterialBottomTabParams = {
  Agenda: undefined;
  Calendar: CalendarStackParamList;
  PainLogEntry: undefined;
  ContactList: undefined;
};

const MaterialBottomTabs = createMaterialBottomTabNavigator<
  MaterialBottomTabParams
>();

export default function MaterialBottomTabsScreen() {
  return (
    <MaterialBottomTabs.Navigator barStyle={styles.tabBar}>
      <MaterialBottomTabs.Screen
        name="Agenda"
        component={Agenda}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
          tabBarColor: '#C9E7F8',
        }}
      />
      <MaterialBottomTabs.Screen
        name="Calendar"
        component={CalendarNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={26} />
          ),
          tabBarColor: '#C9E7F8',
        }}
      />
      <MaterialBottomTabs.Screen
        name="ContactList"
        component={ContactList}
        options={{
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="contacts" color={color} size={26} />
          ),
          tabBarColor: '#F7EAA2',
        }}
      />
      <MaterialBottomTabs.Screen
        name="PainLogEntry"
        component={PainLogEntry}
        options={{
          tabBarLabel: 'PainLog',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="human" color={color} size={26} />
          ),
          tabBarColor: '#FAD4D6',
        }}
      />
    </MaterialBottomTabs.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
  },
});
