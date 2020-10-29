import React, {Suspense} from 'react';
import {ScrollView, StyleSheet, View, Dimensions, ScaledSize} from 'react-native';
import {
  Subheading,
  Avatar,
  Button,
  Divider,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import SettingsItem from '../shared/SettingsItem';
import {useSelector, useDispatch} from 'react-redux';
import {State} from '../../Types';
import {ToggleThemeAction, paperColors} from '../../reducers/ThemeReducer';
import {themeIsDark} from '../../reducers/ThemeReducer';
import {signOut, getUserById} from '../../middleware/AuthMiddleware';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import Tags from '../shared/Tags';
import Medications from '../shared/Medications';
import Contacts from '../shared/Contacts';
import {User} from '../../reducers/AuthReducer';
import {Link} from '@react-navigation/native';

enum ProfileViews {
  'PRIVATE' = 0,
  'PUBLIC' = 1,
}

export enum ProfileLayouts {
  'SIDEBAR' = 0,
  'PAGE' = 1,
}

const TabsLinks = () => {
  const [theme] = useSelector((state: State) => [state.theme]);
  const color = theme.paper.colors.text;
  return (
    <View>
      <View style={styles.row}>
        <Link to="/">
          <MaterialCommunityIcons name="comment" color={color} size={26} />
        </Link>
        <Link to="/calendar/">
          <MaterialCommunityIcons name="calendar" color={color} size={26} />
        </Link>
        <Link to="/contacts/">
          <MaterialCommunityIcons name="contacts" color={color} size={26} />
        </Link>
        <Link to="/medications/">
          <MaterialCommunityIcons name="pill" color={color} size={26} />
        </Link>
        <Link to="/painlog/">
          <MaterialCommunityIcons name="human" color={color} size={26} />
        </Link>
      </View>
      <Divider />
    </View>
  );
};

const SideBar = () => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const dispatch = useDispatch();
  const toggleTheme = () => dispatch(ToggleThemeAction());
  const logout = () => dispatch(signOut());
  const thumbnail =
    user !== false && user.photoURL !== undefined && user.photoURL.href
      ? user.photoURL.href
      : null;
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
  if (user === false) {
    return (
      <View>
        <Text>Please sign in</Text>
      </View>
    );
  } else {
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
          <Link to="/profile/">
            <MaterialCommunityIcons
              style={styles.settingsIcon}
              name="cogs"
              color={paperColors(theme).text}
              size={26}
            />
          </Link>
        </View>
        <SettingsItem
          label="Dark theme"
          value={themeIsDark(theme)}
          onValueChange={() => toggleTheme()}
        />
        <Divider />
        {isLandscapeOnPhone && <TabsLinks />}
        <Divider />
        <Suspense fallback={<ActivityIndicator />}>
          <Tags userId={user.uid} />
        </Suspense>
        <Divider />
        <Medications display="list" />
        <Divider />
        <Contacts display="list" />
        <Divider />
        <Button onPress={() => logout()} style={styles.button}>
          Sign Out
        </Button>
      </ScrollView>
    );
  }
};

const ProfilePage = ({userId}: {userId?: string}) => {
  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState<User>(
    useSelector((state: State) => state.user),
  );
  const [error, setError] = React.useState<Error | undefined>();
  React.useEffect(() => {
    const getUserConditionally = async () => {
      if (userId && (!user || userId !== user.uid)) {
        await getUserById(userId)
          .then((u) => setUser(u))
          .catch((e) => setError(e))
          .then(() => setReady(true));
      } else {
        setReady(true);
      }
    };
    !ready && getUserConditionally();
  }, [ready, user, userId]);
  const profileView =
    userId !== undefined && user !== false && userId !== user.uid
      ? ProfileViews.PUBLIC
      : ProfileViews.PRIVATE;
  const theme = useSelector((state: State) => state.theme);
  const dispatch = useDispatch();
  const toggleTheme = () => dispatch(ToggleThemeAction());
  const logout = () => dispatch(signOut());
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
          <Tags
            userId={user.uid}
            onTagsChanged={(t) => {
              /* do nothing*/
            }}
          />
        </Suspense>
        <Divider />
        <Medications display="summary" userId={user.uid} />
        <Divider />
        <Contacts display="summary" userId={user.uid} />
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
        {user && user.displayName !== null && (
          <Subheading style={styles.name}>{user.displayName}</Subheading>
        )}
        <Link to={`/messages/${user.uid}`}>Message</Link>
        <Suspense fallback={<ActivityIndicator />}>
          <Tags userId={user.uid} />
        </Suspense>
        <Divider />
        <Medications userId={user.uid} display="list" />
        <Divider />
        <Contacts userId={user.uid} display="list" />
      </ScrollView>
    );
  }
};

const Profile = ({
  layout,
  userId,
}: {
  layout?: ProfileLayouts;
  userId?: string;
}) => {
  const pageLayout = layout ? layout : ProfileLayouts.SIDEBAR;
  if (pageLayout === ProfileLayouts.PAGE) {
    return <ProfilePage userId={userId} />;
  } else {
    return <SideBar />;
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
