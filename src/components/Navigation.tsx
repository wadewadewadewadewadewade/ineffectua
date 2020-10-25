import * as React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  Platform,
  StatusBar,
  Dimensions,
  ScaledSize,
  Linking,
  View,
  StyleSheet,
} from 'react-native';
import {firebase} from '../firebase/config';
import {
  Provider as PaperProvider,
  Appbar,
  ActivityIndicator,
} from 'react-native-paper';
import {InitialState, NavigationContainer} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import {
  createStackNavigator,
  HeaderStyleInterpolators,
} from '@react-navigation/stack';
import {Action} from '../reducers';
import {
  navigationRef,
  getHeaderTitle,
  formatDocumentTitle,
} from './RootNavigation';
// use this to restart the app for things like changing RTL to LTR
//import {restartApp} from './Restart';
import {AsyncStorage} from 'react-native';
import LinkingPrefixes from './LinkingPrefixes';
import MaterialBottomTabs from './MaterialBottomTabs';
import NotFound from './NotFound';
import AuthFlow from './authentication/AuthFlow';
import Profile, {ProfileLayouts} from './authentication/Profile';
import {
  NAVIGATION_PERSISTENCE_KEY,
  State,
  RootDrawerParamList,
  RootStackParamList,
} from '../Types';
import {
  SignInAction,
  isUserAuthenticated,
  SignOutAction,
  User,
} from '../reducers/AuthReducer';
import {paperTheme, barClassName, paperColors} from '../reducers/ThemeReducer';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {getUserById} from '../middleware/AuthMiddleware';
import {ThunkDispatch} from 'redux-thunk';

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  const [theme, user] = useSelector((state: State) => [
    state.theme,
    state.user,
  ]);
  const dispatch = useDispatch<ThunkDispatch<State, {}, Action>>();
  const signIn = React.useCallback(
    (userState: User) => !user && dispatch(SignInAction(userState)),
    [dispatch, user],
  );
  const signOut = React.useCallback(() => dispatch(SignOutAction()), [
    dispatch,
  ]);
  const [isReady, setIsReady] = React.useState(Platform.OS === 'web');
  const [initialState, setInitialState] = React.useState<
    InitialState | undefined
  >();

  React.useEffect(() => {
    const unsubscribe = firebase
      .auth()
      .onAuthStateChanged((userState: firebase.User | null) => {
        if (userState === null) {
          if (user) {
            signOut();
          }
        } else {
          if (!user) {
            getUserById(userState.uid).then((u) => {
              if (u) {
                u.getIdToken = (forceRefresh?: boolean | undefined) =>
                  userState.getIdToken(forceRefresh);
                signIn(u);
              }
            });
          }
        }
      });
    return () => unsubscribe();
  }, [user, signIn, signOut]);

  // this will allow us to re-enable analytics after user approves...once I create that user-flow
  /*React.useEffect(() => {
    const enableAnalytics = async () => {
      firebase.analytics().setAnalyticsCollectionEnabled(true);
    }
    enableAnalytics()
  }, [])*/
  let previousRouteName: string | undefined = 'Agenda';
  React.useEffect(() => {
    const restoreState = async () => {
      try {
        // only do the rest if signed in
        if (user) {
          const initialUrl = await Linking.getInitialURL();

          if (Platform.OS !== 'web' || initialUrl === null) {
            const savedState = await AsyncStorage.getItem(
              NAVIGATION_PERSISTENCE_KEY,
            );

            const savedStateName = savedState
              ? JSON.parse(savedState)
              : undefined;

            if (savedStateName !== undefined) {
              // eslint-disable-next-line react-hooks/exhaustive-deps
              previousRouteName = getHeaderTitle(savedStateName);
              setInitialState(savedStateName);
            }
          }
        }
      } finally {
        user && setIsReady(true);
      }
    };
    !isReady && restoreState();
  }, [isReady]);

  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
  React.useEffect(() => {
    const onDimensionsChange = ({window}: {window: ScaledSize}) => {
      setDimensions(window);
    };
    Dimensions.addEventListener('change', onDimensionsChange);
    return () => Dimensions.removeEventListener('change', onDimensionsChange);
  }, []);
  const isLargeScreen = dimensions.width >= 1024;

  if (!isReady) {
    return (
      <View style={styles.activityIndicator}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme(theme)}>
      {Platform.OS === 'ios' && <StatusBar barStyle={barClassName(theme)} />}
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
            AsyncStorage
              ? AsyncStorage.setItem(
                  NAVIGATION_PERSISTENCE_KEY,
                  JSON.stringify(state),
                )
              : console.warn(
                  "AsyncStorage error - I bet you're in a web browser",
                );
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
                initialRouteName: 'Tabs',
                screens: {
                  Tabs: {
                    initialRouteName: 'Agenda',
                    screens: {
                      Calendar: 'calendar/',
                      PainLog: 'pain-log/',
                      ContactsList: 'contacts/',
                      MedicationsList: 'medications/',
                      Agenda: {
                        initialRouteName: 'Agenda',
                        screens: {
                          Agenda: {
                            path: '',
                          },
                          Post: {
                            path: 'posts/:id',
                          },
                          Posts: {
                            path: ':type/:id',
                          },
                        },
                      },
                    },
                  },
                  SignIn: 'sign-in/',
                  NotFound: '.+',
                },
              },
            },
          },
        }}
        fallback={<ActivityIndicator />}
        documentTitle={{
          formatter: formatDocumentTitle,
        }}>
        {isUserAuthenticated(user) ? (
          <Drawer.Navigator
            drawerType={isLargeScreen ? 'permanent' : undefined}
            drawerContent={() => <Profile />}>
            <Drawer.Screen name="Root">
              {({navigation}: DrawerScreenProps<RootDrawerParamList>) => (
                <Stack.Navigator
                  screenOptions={{
                    headerTitle: getHeaderTitle(),
                    headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
                  }}>
                  <Stack.Screen
                    name="Tabs"
                    options={{
                      headerLeft: isLargeScreen
                        ? undefined
                        : () => (
                            <Appbar.Action
                              color={paperColors(theme).text}
                              icon={() => (
                                <MaterialCommunityIcons
                                  name="menu"
                                  color={paperColors(theme).text}
                                  size={26}
                                />
                              )}
                              onPress={() => navigation.toggleDrawer()}
                            />
                          ),
                    }}
                    component={MaterialBottomTabs}
                  />
                  <Stack.Screen
                    name="Profile"
                    children={() => {
                      return <Profile layout={ProfileLayouts.PAGE} />;
                    }}
                    options={{
                      title: getHeaderTitle(),
                    }}
                  />
                  <Stack.Screen
                    name="NotFound"
                    component={NotFound}
                    options={{
                      title: getHeaderTitle(),
                    }}
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
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Navigation;
