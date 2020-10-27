import * as React from 'react';
import 'react-native-gesture-handler';
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
import {InitialState, NavigationContainer, useLinking, getStateFromPath} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import {
  createStackNavigator,
  HeaderStyleInterpolators,
} from '@react-navigation/stack';
import {Action} from '../reducers';
import {navigationRef, formatTitle} from './RootNavigation';
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
  const [isReady, setIsReady] = React.useState(false);
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
  let previousRouteName: string | undefined;
  const { getInitialState } = useLinking(navigationRef, {
    prefixes: LinkingPrefixes,
    config: {
      screens: {
        Root: {
          path: '',
          initialRouteName: 'Tabs',
          screens: {
            Profile: 'profile/:userId',
            SignIn: 'sign-in/',
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
            NotFound: '.+',
          },
        },
      },
    },
    /*getStateFromPath(path, config) {
      const defaultState = getStateFromPath(path, config);
      console.log({path, config, defaultState});
      // add first page to routes, then you will have a back btn
      const {routes} = defaultState || {routes: undefined};
      const firstRouteName = 'Agenda';
      if (
        defaultState !== undefined &&
        routes !== undefined &&
        routes.length === 1 &&
        routes[0].name !== firstRouteName
      ) {
        defaultState.routes.push({name: firstRouteName});
        const newState = {...defaultState, routes: [...defaultState.routes, {name: 'Agenda'}]};
        console.log({defaultState, newState})
        return newState;
      }
      return defaultState;
    },*/
  });
  React.useEffect(() => {
    const restoreState = async () => {
      try {
        if (user) {
          const state = await getInitialState();
          console.log({state})
          if (Platform.OS !== 'web' || state === undefined) {
            const savedState = await AsyncStorage.getItem(
              NAVIGATION_PERSISTENCE_KEY,
            );
            const savedStateName = savedState
              ? JSON.parse(savedState)
              : undefined;
            if (savedStateName !== undefined) {
              setInitialState(savedStateName);
            }
          } else {
            setInitialState(state);
          }
        }
      } finally {
        user && setIsReady(true);
      }
    };
    !isReady && restoreState();
  }, [isReady, user, getInitialState]);

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
        fallback={<ActivityIndicator />}
        documentTitle={{
          formatter: (o) => formatTitle(o).title,
        }}>
        {isUserAuthenticated(user) ? (
          <Drawer.Navigator
            drawerType={isLargeScreen ? 'permanent' : undefined}
            drawerContent={() => <Profile layout={ProfileLayouts.SIDEBAR} />}>
            <Drawer.Screen name="Root">
              {({navigation}: DrawerScreenProps<RootDrawerParamList>) => (
                <Stack.Navigator
                  screenOptions={{
                    headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
                  }}>
                  <Stack.Screen
                    name="Tabs"
                    options={({route}) => ({
                      headerRight: isLargeScreen
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
                    })}
                    component={MaterialBottomTabs}
                  />
                  <Stack.Screen
                    name="Profile"
                    children={() => {
                      return <Profile layout={ProfileLayouts.PAGE} />;
                    }}
                  />
                  <Stack.Screen name="NotFound" component={NotFound} />
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
