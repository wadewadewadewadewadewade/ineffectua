import React, {Suspense} from 'react';
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  ScaledSize,
  View,
} from 'react-native';
import {
  Subheading,
  Avatar,
  Button,
  Divider,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import SettingsItem from '../shared/SettingsItem';
import {NavigationContainerRef} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {State} from '../../Types';
import {ToggleThemeAction, paperColors} from '../../reducers/ThemeReducer';
import {themeIsDark} from '../../reducers/ThemeReducer';
import {signOut, getUserById} from '../../middleware/AuthMiddleware';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {getFirebaseData} from '../../middleware';
import {isFetching} from '../../reducers';
import Tags from '../shared/Tags';
import Medications from '../shared/Medications';
import Contacts from '../shared/Contacts';
import {User} from '../../reducers/AuthReducer';

enum ProfileViews {
  'PRIVATE' = 0,
  'PUBLIC' = 1,
}

export enum ProfileLayouts {
  'SIDEBAR' = 0,
  'PAGE' = 1,
}

const getUserIdFromRoute = (navigationRef: NavigationContainerRef | null) => {
  if (navigationRef !== null) {
    const route = navigationRef.getCurrentRoute();
    if (route !== undefined) {
      const params = route.params;
      if (params !== undefined && 'userId' in params) {
        const {userId} = params as {userId?: string};
        if (userId !== undefined) {
          return userId;
        }
      }
    }
  }
  return undefined;
};

const TabsLinks = ({
  navigationRef,
}: {
  navigationRef: NavigationContainerRef | null;
}) => {
  const [theme] = useSelector((state: State) => [state.theme]);
  const color = theme.paper.colors.text;
  return (
    <View>
      <View style={styles.row}>
        <TouchableHighlight onPress={() => navigationRef?.navigate('Agenda')}>
          <MaterialCommunityIcons name="home" color={color} size={26} />
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigationRef?.navigate('Calendar')}>
          <MaterialCommunityIcons name="calendar" color={color} size={26} />
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => navigationRef?.navigate('ContactsList')}>
          <MaterialCommunityIcons name="contacts" color={color} size={26} />
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => navigationRef?.navigate('MedicationsList')}>
          <MaterialCommunityIcons name="pill" color={color} size={26} />
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigationRef?.navigate('PainLog')}>
          <MaterialCommunityIcons name="human" color={color} size={26} />
        </TouchableHighlight>
      </View>
      <Divider />
    </View>
  );
};

const SideBar = ({
  navigationRef,
}: {
  navigationRef: NavigationContainerRef | null;
}) => {
  const userId = getUserIdFromRoute(navigationRef); // no userId supplied means private
  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState<User>(
    useSelector((state: State) => state.user),
  );
  const [error, setError] = React.useState<Error | undefined>();
  React.useEffect(() => {
    const getUserConditionally = async () => {
      if (userId) {
        getUserById(userId)
          .then((u) => setUser(u))
          .catch((e) => setError(e))
          .then(() => setReady(true));
      } else {
        setReady(true);
      }
    };
    !ready && getUserConditionally();
  }, [ready, userId]);
  const profileView =
    userId !== undefined && user !== false && userId !== user.uid
      ? ProfileViews.PUBLIC
      : ProfileViews.PRIVATE;
  const theme = useSelector((state: State) => state.theme);
  const dispatch = useDispatch();
  const toggleTheme = () => dispatch(ToggleThemeAction());
  const logout = () => dispatch(signOut());
  const refreshDataFromFirebase = () => getFirebaseData(dispatch);
  const fetching = (is: boolean) => dispatch(isFetching(is));
  const thumbnail =
    user !== false && user.photoURL !== undefined && user.photoURL.href
      ? user.photoURL.href
      : null;
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
  const isLandscapeOnPhone =
    dimensions.width > dimensions.height && dimensions.height <= 420;
  React.useEffect(() => {
    const onDimensionsChange = ({window}: {window: ScaledSize}) => {
      setDimensions(window);
    };
    Dimensions.addEventListener('change', onDimensionsChange);
    return () => Dimensions.removeEventListener('change', onDimensionsChange);
  }, []);
  if (error) {
    return (
      <View>
        <Text>An error occured: {error.message}</Text>
      </View>
    );
  } else if (user === false) {
    return (
      <View>
        <Text>Please sign in</Text>
      </View>
    );
  } else if (profileView === ProfileViews.PRIVATE) {
    return (
      <ScrollView style={styles.content}>
        <View style={styles.row}>
          <View style={styles.avatarAndName}>
            {thumbnail ? (
              <Avatar.Image source={{uri: thumbnail}} style={styles.image} />
            ) : null}
            <Text style={styles.name}>
              Hi
              {user && user.displayName !== null ? ' ' + user.displayName : ''}!
            </Text>
          </View>
          <MaterialCommunityIcons
            onPress={() => {
              navigationRef?.navigate('Root', {screen: 'Profile'});
            }}
            style={styles.settingsIcon}
            name="cogs"
            color={paperColors(theme).text}
            size={26}
          />
        </View>
        <SettingsItem
          label="Dark theme"
          value={themeIsDark(theme)}
          onValueChange={() => toggleTheme()}
        />
        <Divider />
        {isLandscapeOnPhone && <TabsLinks navigationRef={navigationRef} />}
        <Divider />
        <Suspense fallback={<ActivityIndicator />}>
          <Tags userId={user.uid} />
        </Suspense>
        <Divider />
        <Medications display="list" navigationRef={navigationRef} />
        <Divider />
        <Contacts display="list" navigationRef={navigationRef} />
        <Divider />
        <Button
          onPress={() => {
            fetching(true);
            refreshDataFromFirebase().finally(() => fetching(false));
          }}
          style={styles.button}>
          <Text>Refresh Data</Text>
        </Button>
        <Divider />
        <Button onPress={() => logout()} style={styles.button}>
          Sign Out
        </Button>
      </ScrollView>
    );
  } else {
    // public
    return (
      <ScrollView style={styles.content}>
        {thumbnail ? (
          <Avatar.Image source={{uri: thumbnail}} style={styles.image} />
        ) : null}
        <Subheading>
          {user && user.displayName !== null ? ' ' + user.displayName : ''}!
        </Subheading>
        {isLandscapeOnPhone && <TabsLinks navigationRef={navigationRef} />}
        <Divider />
        <Suspense fallback={<ActivityIndicator />}>
          <Tags userId={user.uid} />
        </Suspense>
        <Divider />
        <Medications display="list" navigationRef={navigationRef} />
        <Divider />
        <Contacts display="list" navigationRef={navigationRef} />
      </ScrollView>
    );
  }
};

const ProfilePage = ({
  navigationRef,
}: {
  navigationRef: NavigationContainerRef | null;
}) => {
  const [ready, setReady] = React.useState(false);
  const userId = getUserIdFromRoute(navigationRef); // no userId supplied means private
  const [user, setUser] = React.useState<User>(
    useSelector((state: State) => state.user),
  );
  const [error, setError] = React.useState<Error | undefined>();
  React.useEffect(() => {
    const getUserConditionally = async () => {
      if (userId) {
        getUserById(userId)
          .then((u) => setUser(u))
          .catch((e) => setError(e))
          .then(() => setReady(true));
      } else {
        setReady(true);
      }
    };
    !ready && getUserConditionally();
  }, [ready, userId]);
  const profileView =
    userId !== undefined && user !== false && userId !== user.uid
      ? ProfileViews.PUBLIC
      : ProfileViews.PRIVATE;
  const theme = useSelector((state: State) => state.theme);
  const dispatch = useDispatch();
  const toggleTheme = () => dispatch(ToggleThemeAction());
  const logout = () => dispatch(signOut());
  const refreshDataFromFirebase = () => getFirebaseData(dispatch);
  const fetching = (is: boolean) => dispatch(isFetching(is));
  const thumbnail =
    user !== false && user.photoURL !== undefined && user.photoURL.href
      ? user.photoURL.href
      : null;
  if (error) {
    return (
      <View>
        <Text>An error occured: {error.message}</Text>
      </View>
    );
  } else if (user === false) {
    return (
      <View>
        <Text>Please sign in</Text>
      </View>
    );
  } else if (profileView === ProfileViews.PRIVATE) {
    return (
      <ScrollView style={styles.content}>
        {thumbnail ? (
          <Avatar.Image source={{uri: thumbnail}} style={styles.image} />
        ) : null}
        <Subheading style={styles.name}>
          Hi{user && user.displayName !== null ? ' ' + user.displayName : ''}!
        </Subheading>
        <SettingsItem
          label="Dark theme"
          value={themeIsDark(theme)}
          onValueChange={() => toggleTheme()}
        />
        <Divider />
        <Suspense fallback={<ActivityIndicator />}>
          <Tags userId={user.uid} />
        </Suspense>
        <Divider />
        <Medications
          display="summary"
          userId={user.uid}
          navigationRef={navigationRef}
        />
        <Divider />
        <Contacts
          display="summary"
          userId={user.uid}
          navigationRef={navigationRef}
        />
        <Divider />
        <Button
          onPress={() => {
            fetching(true);
            refreshDataFromFirebase().finally(() => fetching(false));
          }}
          style={styles.button}>
          <Text>Refresh Data</Text>
        </Button>
        <Divider />
        <Button onPress={() => logout()} style={styles.button}>
          Sign Out
        </Button>
      </ScrollView>
    );
  } else {
    // public
    return (
      <ScrollView style={styles.content}>
        {thumbnail ? (
          <Avatar.Image source={{uri: thumbnail}} style={styles.image} />
        ) : null}
        {user && user.displayName !== null &&
          <Subheading style={styles.name}>{user.displayName}</Subheading>
        }
        <Button
          theme={theme.paper}
          onPress={() => navigationRef?.navigate('Root', {screen: 'Messaging', props: {userId: user.uid}})}
        >Message</Button>
        <Suspense fallback={<ActivityIndicator />}>
          <Tags userId={user.uid} />
        </Suspense>
        <Divider />
        <Medications
          userId={user.uid}
          display="list"
          navigationRef={navigationRef}
        />
        <Divider />
        <Contacts
          userId={user.uid}
          display="list"
          navigationRef={navigationRef}
        />
      </ScrollView>
    );
  }
};

const Profile = ({
  layout,
  navigationRef,
}: {
  layout?: ProfileLayouts;
  navigationRef: NavigationContainerRef | null;
}) => {
  const pageLayout = layout ? layout : ProfileLayouts.SIDEBAR;
  if (pageLayout === ProfileLayouts.PAGE) {
    return <ProfilePage navigationRef={navigationRef} />;
  } else {
    return <SideBar navigationRef={navigationRef} />;
  }
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  avatarAndName: {
    flex: 1,
  },
  settingsIcon: {
    fontSize: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  content: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    margin: 8,
  },
  text: {
    textAlign: 'center',
    margin: 8,
  },
  image: {
    alignSelf: 'center',
  },
  name: {
    textAlign: 'center',
  },
});

export default Profile;
