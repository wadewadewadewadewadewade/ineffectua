import * as React from 'react';
import {StyleSheet, Dimensions, ScaledSize} from 'react-native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import PainLog from './painlog/PainLog';
import Contacts from './Contacts/Contacts';
import Agenda from './agenda/Agenda';
import CalendarNavigator, {
  CalendarStackParamList,
} from './calendar/CalendarNavigator';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import Medications from './Medications/Medications';
import {contrast} from '../middleware/DataTypesMiddleware';
import {formatDocumentTitle, getHeaderTitle} from './RootNavigation';
import {createStackNavigator} from '@react-navigation/stack';

export type MaterialBottomTabParams = {
  Agenda: {screen: 'Posts'; type?: string; id?: string};
  Calendar: CalendarStackParamList;
  PainLog: undefined;
  Contacts: undefined;
  Medications: undefined;
};

export type PostsStackParams = {
  Posts: {type?: string; id?: string; title?: string};
};

const MaterialBottomTabs = createMaterialBottomTabNavigator<
  MaterialBottomTabParams
>();
const PostsStack = createStackNavigator<PostsStackParams>();

const PostsStackNavigator = () => {
  return (
    <PostsStack.Navigator>
      <PostsStack.Screen
        name="Posts"
        component={Agenda}
        options={{title: getHeaderTitle()}}
      />
    </PostsStack.Navigator>
  );
};

export default function MaterialBottomTabsScreen() {
  const colors = new Array<string>();
  const randomColor = () => {
    // pick a color that is neither too dark nor too light
    const randomIndividualColor = () => {
      const range = 128;
      const shift = Math.floor((256 - range) / 2);
      const color = Math.floor(Math.random() * range + shift).toString(16);
      return color.length < 2 ? '0' + color : color;
    };
    return (
      randomIndividualColor() +
      randomIndividualColor() +
      randomIndividualColor()
    );
  };
  for (let i = 0; i < 5; i++) {
    let color = randomColor();
    if (color.length < 6) {
      color = '0'.repeat(6 - color.length) + color;
    }
    colors.push('#' + color);
  }
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));

  React.useEffect(() => {
    const onDimensionsChange = ({window}: {window: ScaledSize}) => {
      setDimensions(window);
    };

    Dimensions.addEventListener('change', onDimensionsChange);

    return () => Dimensions.removeEventListener('change', onDimensionsChange);
  }, []);

  const isLandscapeOnPhone =
    dimensions.width > dimensions.height && dimensions.height <= 420;

  return (
    <SafeAreaProvider>
      <MaterialBottomTabs.Navigator
        labeled={false}
        // eslint-disable-next-line react-native/no-inline-styles
        barStyle={{
          ...styles.tabBar,
          display: isLandscapeOnPhone ? 'none' : 'flex',
        }}>
        <MaterialBottomTabs.Screen
          name="Agenda"
          component={PostsStackNavigator}
          options={(options) => ({
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons
                name="comment"
                color={contrast(color)}
                size={26}
              />
            ),
            tabBarColor: colors[0],
            tabBarLabel: formatDocumentTitle(options),
          })}
        />
        <MaterialBottomTabs.Screen
          name="Calendar"
          component={CalendarNavigator}
          options={(options) => ({
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons
                name="calendar"
                color={contrast(color)}
                size={26}
              />
            ),
            tabBarColor: colors[1],
            tabBarLabel: formatDocumentTitle(options),
          })}
        />
        <MaterialBottomTabs.Screen
          name="Contacts"
          component={Contacts}
          options={(options) => ({
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons
                name="contacts"
                color={contrast(color)}
                size={26}
              />
            ),
            tabBarColor: colors[2],
            tabBarLabel: formatDocumentTitle(options),
          })}
        />
        <MaterialBottomTabs.Screen
          name="Medications"
          component={Medications}
          options={(options) => ({
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons
                name="pill"
                color={contrast(color)}
                size={26}
              />
            ),
            tabBarColor: colors[3],
            tabBarLabel: formatDocumentTitle(options),
          })}
        />
        <MaterialBottomTabs.Screen
          name="PainLog"
          component={PainLog}
          options={(options) => ({
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons
                name="human"
                color={contrast(color)}
                size={26}
              />
            ),
            tabBarColor: colors[4],
            tabBarLabel: formatDocumentTitle(options),
          })}
        />
      </MaterialBottomTabs.Navigator>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
  },
  tabBarLabel: {
    paddingBottom: 6,
    fontSize: 10,
    textAlign: 'center',
  },
  tabBarLabelActive: {
    color: 'red',
  },
});
