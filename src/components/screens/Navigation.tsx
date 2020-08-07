import * as React from 'react';
import { connect } from 'react-redux';
import {
  Platform,
  StatusBar,
  Dimensions,
  ScaledSize,
  Linking,
  Text,
  View,
} from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { enableScreens } from 'react-native-screens';
import {
  Provider as PaperProvider,
  Appbar,
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import {
  InitialState,
  NavigationContainer,
  NavigationContainerRef,
  getFocusedRouteNameFromRoute,
  RouteProp,
  Theme
} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import {
  createStackNavigator,
  HeaderStyleInterpolators,
} from '@react-navigation/stack';
import { useReduxDevToolsExtension } from '@react-navigation/devtools';

// use this to restart the app for things like changing RTL to LTR
//import { restartApp } from './Restart';
import { AsyncStorage } from 'react-native';
import LinkingPrefixes from '../LinkingPrefixes';
import MaterialBottomTabs from '../screens/MaterialBottomTabs';
import NotFound from './NotFound';
import AuthFlow from './AuthFlow';

import { User } from 'firebase';
import * as Analytics from 'expo-firebase-analytics';
import Profile from './Profile';

import { NAVIGATION_PERSISTENCE_KEY, State } from '../../Types';
import { SignInAction, Action as AuthAction } from '../../reducers/AuthReducer';
import { paperTheme, CombinedLightTheme } from '../../reducers/ThemeReducer';
import { ScrollView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

enableScreens();

type RootDrawerParamList = {
  Root: undefined;
  Another: undefined;
};

type RootStackParamList = {
  Tabs: undefined
  AuthFlow: undefined;
  NotFound: undefined;
  ModalScreen: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function ModalScreen(props : {
    navigation: NavigationContainerRef,
    route: RouteProp<RootStackParamList, "Tabs">
  }) {
    const { navigation, route } = props;
    const { component, date } = route.params as any;
    return (
      <View>
        {component}
        <Button onPress={() => navigation.goBack()}><Text>Dismiss</Text></Button>
      </View>
    );
}

const Navigation = (props: { theme: Theme | undefined, setUser: (user: User) => void}) => {
  const { theme, setUser } = props;
  const [isReady, setIsReady] = React.useState(Platform.OS === 'web');
  const [initialState, setInitialState] = React.useState<
    InitialState | undefined
  >();

  function getHeaderTitle(route: RouteProp<RootStackParamList, "Tabs"> | string | undefined) {
    // If the focused route is not found, we need to assume it's the initial screen
    // This can happen during if there hasn't been any navigation inside the screen
    // In our case, it's "Feed" as that's the first screen inside the navigator
    let routeName = typeof route === 'string' ? route : route !== undefined && typeof route !== 'string' ? getFocusedRouteNameFromRoute(route) ?? 'Feed' : 'Feed';

    switch (routeName) {
      case 'ModalScreen':
        return ((route as RouteProp<RootStackParamList, "Tabs">)?.params as any).title
      case 'Agenda':
      case 'Feed':
        return 'Agenda';
      case 'CalendarEntry':
      case 'Calendar':
        return 'Calendar';
      case 'PainLogEntry':
      case 'PainLog':
        return 'Pain Log';
      case 'Profile':
        return 'My Profile';
      case 'Contacts':
        return 'Contacts';
      case 'Account':
        return 'My Account';
    }
  }

  /*React.useEffect(() => {
    return auth().onAuthStateChanged(userState => {
        if (userState === null) {
          // user is not authenticated, so navigate
          navigationRef.current?.navigate('AuthFlow');
        } else {
          setUser(userState);
        }
      });
  }, []);*/

  let previousRouteName = 'Feed';

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (Platform.OS !== 'web' || initialUrl === null) {
          const savedState = await AsyncStorage.getItem(
            NAVIGATION_PERSISTENCE_KEY
          );

          const state = savedState ? JSON.parse(savedState) : undefined;

          if (state !== undefined) {
            previousRouteName = getHeaderTitle(state) as string;
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };

    restoreState();
  }, []);

  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));

  React.useEffect(() => {
    const onDimensionsChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    Dimensions.addEventListener('change', onDimensionsChange);

    return () => Dimensions.removeEventListener('change', onDimensionsChange);
  }, []);

  const navigationRef = React.useRef<NavigationContainerRef>(null);

  useReduxDevToolsExtension(navigationRef);

  if (!isReady) {
    return null;
  }

  const isLargeScreen = dimensions.width >= 1024;

  return (
    <PaperProvider theme={paperTheme(theme)}>
      {Platform.OS === 'ios' && (
        <StatusBar barStyle={theme !== undefined ? theme.dark ? 'light-content' : 'dark-content' : 'light-content'} />
      )}
      <NavigationContainer
        ref={navigationRef}
        initialState={initialState}
        onStateChange={(state) => {
          const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

          if (previousRouteName !== currentRouteName) {
            // The line below uses the expo-firebase-analytics tracker
            // https://docs.expo.io/versions/latest/sdk/firebase-analytics/
            // Change this line to use another Mobile analytics SDK
            Analytics.setCurrentScreen(currentRouteName);
            AsyncStorage ? AsyncStorage.setItem(
              NAVIGATION_PERSISTENCE_KEY,
              JSON.stringify(state)
            ) : console.warn('AsyncStorage error - I bet you\'re in a web browser')
          }

          // Save the current route name for later comparision
          if (currentRouteName) {
            previousRouteName = currentRouteName;
          }

        }}
        theme={theme}
        linking={{
          // To test deep linking on, run the following in the Terminal:
          // Android: adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:19000/--/simple-stack"
          // iOS: xcrun simctl openurl booted exp://127.0.0.1:19000/--/simple-stack
          // Android (bare): adb shell am start -a android.intent.action.VIEW -d "rne://127.0.0.1:19000/--/simple-stack"
          // iOS (bare): xcrun simctl openurl booted rne://127.0.0.1:19000/--/simple-stack
          // The first segment of the link is the the scheme + host (returned by `Linking.makeUrl`)
          prefixes: LinkingPrefixes,
          config: {
            screens: {
              Root: {
                path: '',
                initialRouteName: 'Agenda',
                screens: {
                  Calendar: 'calendar/:id?',
                  CalendarEntry: 'calendar/:id?',
                  PainLog: 'pain-log/',
                  PainLogEntry: 'pain-log/:id',
                  Contacts: 'people',
                  Dialog: 'dialog',
                  Agenda: '',
                  NotFound: '.+',
                },
              },
            },
          },
        }}
        fallback={<ActivityIndicator />}
        documentTitle={{
          formatter: (options, route) =>
            `${options?.title ?? getHeaderTitle(route?.name)} - ineffectua`,
        }}
      >
        <Drawer.Navigator drawerType={isLargeScreen ? 'permanent' : undefined} drawerContent={props => <Profile {...props}/>}>
          <Drawer.Screen name="Root">
            {({ navigation }: DrawerScreenProps<RootDrawerParamList>) => (
              <Stack.Navigator
                screenOptions={{
                  headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
                }}
              >
                <Stack.Screen
                  name="Tabs"
                  options={({ route }) => ({
                    headerTitle: getHeaderTitle(route),
                    headerLeft: isLargeScreen
                      ? undefined
                      : () => (
                          <Appbar.Action
                            color={theme !== undefined ? theme.colors.text : CombinedLightTheme.colors.text}
                            icon={() => <MaterialCommunityIcons name="folder" color={theme !== undefined ? theme.colors.text : CombinedLightTheme.colors.text} size={26} />}
                            onPress={() => navigation.toggleDrawer()}
                          />
                        ),
                  })}
                  component={MaterialBottomTabs}
                />
                <Stack.Screen
                  name="AuthFlow"
                  component={AuthFlow}
                />
                <Stack.Screen
                  name="ModalScreen"
                  options={({route}) => ({ title: route.params && (route.params as any).title })}
                  component={ModalScreen}
                />
                <Stack.Screen
                  name="NotFound"
                  component={NotFound}
                  options={{ title: 'Oops!' }}
                />
              </Stack.Navigator>
            )}
          </Drawer.Screen>
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  )
}

// Map State To Props (Redux Store Passes State To Component)
const mapStateToProps = (state: State) => {
  // Redux Store --> Component
  return {
    theme: state.ThemeReducer.theme
  };
};// Map Dispatch To Props (Dispatch Actions To Reducers. Reducers Then Modify The Data And Assign It To Your Props)
const mapDispatchToProps = (dispatch: (value: AuthAction) => void) => {
  // Action
  return {
    // Login
    setUser: (user: User) => dispatch(SignInAction(user)),
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Navigation)