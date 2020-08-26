import * as React from 'react';
import { connect } from 'react-redux';
import {
  Platform,
  StatusBar,
  Dimensions,
  ScaledSize,
  Linking,
} from 'react-native';
import { firebase } from '../firebase/config';
import { User } from 'firebase';
import {
  Provider as PaperProvider,
  Appbar,
  ActivityIndicator,
} from 'react-native-paper';
import {
  InitialState,
  NavigationContainer,
  NavigationContainerRef,
  getFocusedRouteNameFromRoute,
  RouteProp,
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
import LinkingPrefixes from './LinkingPrefixes';
import MaterialBottomTabs from './MaterialBottomTabs';
import NotFound from './NotFound';
import AuthFlow from './authentication/AuthFlow';

import Profile from './authentication/Profile';

import { NAVIGATION_PERSISTENCE_KEY, State, RootDrawerParamList, RootStackParamList } from '../Types';
import { SignInAction, Action as AuthAction, isUserAuthenticated, AuthState } from '../reducers/AuthReducer';
import { paperTheme, CombinedLightTheme, Theme, barClassName, paperColors, ThemeState } from '../reducers/ThemeReducer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CalendarStackParamList } from './calendar/CalendarNavigator';
import { CalendarDayProps } from './calendar/CalendarDay';

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const Navigation = (props: {
    theme: ThemeState['theme'],
    user: AuthState['user'],
    setUser: (user: AuthState['user']) => void
  }) => {
  const { theme, user, setUser } = props;
  const [isReady, setIsReady] = React.useState(Platform.OS === 'web');
  const [initialState, setInitialState] = React.useState<
    InitialState | undefined
  >();

  function getHeaderTitle(
    options: Record<string, any> | undefined,
    route: Readonly<{
      key: string;
      name: string;
      params?: object | undefined;
    }> | undefined,
    savedStateName?: string
  ) {
    // If the focused route is not found, we need to assume it's the initial screen
    // This can happen during if there hasn't been any navigation inside the screen
    // In our case, it's "Feed" as that's the first screen inside the navigator
    let routeName = savedStateName
      || options && options.title
      || route && getFocusedRouteNameFromRoute(route);
    
    switch (routeName) {
      case 'ModalScreen':
        return ((route as RouteProp<RootStackParamList, "Tabs">)?.params as any).title
      case 'Tabs':
      case 'Agenda':
      case 'Feed':
        return 'Agenda';
      case 'CalendarEntry':
        return (route?.params as CalendarDayProps).title;
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
    return routeName;
  }

  React.useEffect(() => {
    return firebase.auth().onAuthStateChanged(userState => {
        if (userState === null) {
          // user is not authenticated, so navigate
          setUser(false);
        } else {
          setUser(userState);
        }
      });
  }, []);

  let previousRouteName = 'Feed';

  // this will allow us to re-enable analytics after user approves...once I create that user-flow
  React.useEffect(() => {
    const enableAnalytics = async () => {
      await firebase.analytics().setAnalyticsCollectionEnabled(true);
    }

    enableAnalytics()
  }, [])

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
            previousRouteName = getHeaderTitle(undefined, undefined, state) as string;
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
    return <ActivityIndicator />;
  }

  const isLargeScreen = dimensions.width >= 1024;

  return (
    <PaperProvider theme={paperTheme(theme)}>
      {Platform.OS === 'ios' && (
        <StatusBar barStyle={barClassName(theme)} />
      )}
      <NavigationContainer
        ref={navigationRef}
        initialState={initialState}
        onStateChange={(state) => {
          const currentRoute = navigationRef.current?.getCurrentRoute();
          const currentRouteName = currentRoute?.name;
          
          if (currentRouteName && previousRouteName !== currentRouteName) {
            // The line below uses the expo-firebase-analytics tracker
            // https://docs.expo.io/versions/latest/sdk/firebase-analytics/
            // Change this line to use another Mobile analytics SDK
            //firebase.analytics().setCurrentScreen(currentRouteName);
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
        theme={theme.navigation}
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
                  CalendarNavigator: 'calendar/',
                  PainLogNavigator: 'pain-log/',
                  ContactsNavigator: 'people',
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
          formatter: getHeaderTitle
        }}>
      {isUserAuthenticated(user) ? (
        <Drawer.Navigator drawerType={isLargeScreen ? 'permanent' : undefined} drawerContent={props => <Profile />}>
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
                    headerTitle: getHeaderTitle(undefined, route),
                    headerLeft: isLargeScreen
                      ? undefined
                      : () => (
                          <Appbar.Action
                            color={paperColors(theme).text}
                            icon={() => <MaterialCommunityIcons name="account" color={paperColors(theme).text} size={26} />}
                            onPress={() => navigation.toggleDrawer()}
                          />
                        ),
                  })}
                  component={MaterialBottomTabs}
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
      ) : (
        <AuthFlow />
      )}
      </NavigationContainer>
    </PaperProvider>
  )
}

// Map State To Props (Redux Store Passes State To Component)
const mapStateToProps = (state: State) => {
  // Redux Store --> Component
  return {
    theme: state.theme ? state.theme : CombinedLightTheme,
    user: state.user
  };
};// Map Dispatch To Props (Dispatch Actions To Reducers. Reducers Then Modify The Data And Assign It To Your Props)
const mapDispatchToProps = (dispatch: (value: AuthAction) => void) => {
  // Action
  return {
    // Login
    setUser: (user: AuthState['user']) => dispatch(SignInAction(user)),
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Navigation)