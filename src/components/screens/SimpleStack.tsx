import * as React from 'react';
import { View, Platform, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import type { ParamListBase } from '@react-navigation/native';
import {
  createStackNavigator,
  StackScreenProps,
} from '@react-navigation/stack';
import CalendarEntry from '../shared/CalendarEntry';
import PainLogEntry from '../shared/PainLogEntry';
import Agenda from '../shared/Agenda';

type SimpleStackParams = {
  CalendarEntry: { author: string } | undefined;
  PainLogEntry: { date: number };
  Agenda: undefined;
};

const scrollEnabled = Platform.select({ web: true, default: false });

const CalendarEntryScreen = ({
  navigation,
  route,
}: StackScreenProps<SimpleStackParams, 'CalendarEntry'>) => {
  return (
    <ScrollView>
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={() => navigation.replace('Agenda')}
          style={styles.button}
        >
          Replace with feed
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.pop()}
          style={styles.button}
        >
          Pop screen
        </Button>
      </View>
      <CalendarEntry
        author={{ name: route.params?.author ?? 'Unknown' }}
        scrollEnabled={scrollEnabled}
      />
    </ScrollView>
  );
};

const AgendaScreen = ({
  route,
  navigation,
}: StackScreenProps<SimpleStackParams, 'Agenda'>) => {
  return (
    <ScrollView>
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('PainLogEntry', { date: Date.now() })}
          style={styles.button}
        >
          Navigate to album
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go back
        </Button>
      </View>
      <Agenda scrollEnabled={scrollEnabled} date={Date.now()} />
    </ScrollView>
  );
};

const PainLogEntryScreen = ({
  navigation,
}: StackScreenProps<SimpleStackParams, 'PainLogEntry'>) => {
  return (
    <ScrollView>
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={() => navigation.push('CalendarEntry', { author: 'Babel fish' })}
          style={styles.button}
        >
          Push article
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.pop(2)}
          style={styles.button}
        >
          Pop by 2
        </Button>
      </View>
      <PainLogEntry scrollEnabled={scrollEnabled} />
    </ScrollView>
  );
};

const SimpleStack = createStackNavigator<SimpleStackParams>();

export default function SimpleStackScreen({
  navigation,
}: StackScreenProps<ParamListBase>) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <SimpleStack.Navigator>
      <SimpleStack.Screen
        name="CalendarEntry"
        component={CalendarEntryScreen}
        options={({ route }) => ({
          title: `Article by ${route.params?.author ?? 'Unknown'}`,
        })}
        initialParams={{ author: 'Gandalf' }}
      />
      <SimpleStack.Screen
        name="Agenda"
        component={Agenda}
        options={{ title: 'Feed' }}
      />
      <SimpleStack.Screen
        name="PainLogEntry"
        component={PainLogEntryScreen}
        options={{ title: 'Albums' }}
      />
    </SimpleStack.Navigator>
  );
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    padding: 8,
  },
  button: {
    margin: 8,
  },
});
