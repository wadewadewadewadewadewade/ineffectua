import * as React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import type { ParamListBase } from '@react-navigation/native';
import {
  createStackNavigator,
  StackScreenProps,
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack';
import CalendarEntry from '../shared/CalendarEntry';
import PainLogEntry from '../shared/PainLogEntry';

type ModalStackParams = {
  CalendarEntry: { author: string };
  PainLogEntry: undefined;
};

const scrollEnabled = Platform.select({ web: true, default: false });

const CalendarEntryScreen = ({
  navigation,
  route,
}: StackScreenProps<ModalStackParams, 'CalendarEntry'>) => {
  return (
    <ScrollView>
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={() => navigation.push('PainLogEntry')}
          style={styles.button}
        >
          Push album
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go back
        </Button>
      </View>
      <CalendarEntry
        author={{ name: route.params.author }}
        scrollEnabled={scrollEnabled}
      />
    </ScrollView>
  );
};

const PainLogEntryScreen = ({ navigation }: StackScreenProps<ModalStackParams>) => {
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
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Go back
        </Button>
      </View>
      <PainLogEntry scrollEnabled={scrollEnabled} />
    </ScrollView>
  );
};

const ModalPresentationStack = createStackNavigator<ModalStackParams>();

type Props = StackScreenProps<ParamListBase> & {
  options?: StackNavigationOptions;
};

export default function SimpleStackScreen({ navigation, options }: Props) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <ModalPresentationStack.Navigator
      mode="modal"
      screenOptions={({ route, navigation }) => ({
        ...TransitionPresets.ModalPresentationIOS,
        cardOverlayEnabled: true,
        gestureEnabled: true,
        headerStatusBarHeight:
          navigation.dangerouslyGetState().routes.indexOf(route) > 0
            ? 0
            : undefined,
      })}
      {...options}
    >
      <ModalPresentationStack.Screen
        name="CalendarEntry"
        component={CalendarEntryScreen}
        options={({ route }) => ({
          title: `Article by ${route.params.author}`,
        })}
        initialParams={{ author: 'Gandalf' }}
      />
      <ModalPresentationStack.Screen
        name="PainLogEntry"
        component={PainLogEntryScreen}
        options={{ title: 'PainLogEntry' }}
      />
    </ModalPresentationStack.Navigator>
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
