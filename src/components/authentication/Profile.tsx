import React, { Suspense } from 'react';
import { ScrollView, StyleSheet, Dimensions, ScaledSize, View } from 'react-native';
import { Subheading, Avatar, Button, Divider, Text, ActivityIndicator } from 'react-native-paper';
import SettingsItem from '../shared/SettingsItem';
import { NavigationContainerRef } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../Types';
import { ToggleThemeAction } from '../../reducers/ThemeReducer';
import { themeIsDark } from '../../reducers/ThemeReducer';
import { signOut } from '../../middleware/AuthMiddleware';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { getFirebaseData } from '../../middleware';
import { isFetching } from '../../reducers';
import Tags from '../shared/Tags';
import Medications from '../shared/Medications';
import Contacts from '../shared/Contacts';

enum ProfileViews {
  'PRIVATE' =0,
  'PUBLIC' = 1
}

const TabsLinks = ({
  navigationRef
}: {
  navigationRef: NavigationContainerRef | null
}) => {
  const [theme] = useSelector((state: State) => ([state.theme]))
  const color = theme.paper.colors.text
  return (
    <View>
      <View style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:16}}>
        <TouchableHighlight onPress={() => navigationRef?.navigate('Agenda')}>
          <MaterialCommunityIcons name="home" color={color} size={26} />
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigationRef?.navigate('Calendar')}>
          <MaterialCommunityIcons name="calendar" color={color} size={26} />
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigationRef?.navigate('ContactsList')}>
          <MaterialCommunityIcons name="contacts" color={color} size={26} />
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigationRef?.navigate('MedicationsList')}>
          <MaterialCommunityIcons name="pill" color={color} size={26} />
        </TouchableHighlight>
        <TouchableHighlight onPress={() => navigationRef?.navigate('PainLog')}>
          <MaterialCommunityIcons name="human" color={color} size={26} />
        </TouchableHighlight>
      </View>
      <Divider/>
    </View>
  )
}

const Profile =
({
  userId,
  navigationRef,
}: {
  userId?: string,
  navigationRef: NavigationContainerRef | null,
}) => {
  const [theme, user] = useSelector((state: State) => ([state.theme, state.user]))
  const dispatch = useDispatch()
  const toggleTheme = () => dispatch(ToggleThemeAction())
  const logout = () => dispatch(signOut())
  const refreshDataFromFirebase = () => getFirebaseData(dispatch)
  const fetching = (is:boolean) => dispatch(isFetching(is))
  const thumbnail = user && user.photoURL !== null && user.photoURL.length > 0 ? require(user.photoURL) : null;
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
  const isLandscapeOnPhone = dimensions.width > dimensions.height && dimensions.height <= 420;
  React.useEffect(() => {
    const onDimensionsChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };
    Dimensions.addEventListener('change', onDimensionsChange);
    return () => Dimensions.removeEventListener('change', onDimensionsChange);
  }, []);
  const view = user && user.uid === userId ? ProfileViews.PUBLIC : ProfileViews.PRIVATE
  if (!user) {
    return (
      <View/>
    )
  } else if (view === ProfileViews.PUBLIC) {
    // load user from route params; should handle full page
    //const targetUser = navigationRef?.getCurrentRoute()?.params?.userId
    return (
      <ScrollView style={styles.content}>
        {thumbnail ? (<Avatar.Image source={thumbnail} style={styles.image} />) : null}
        <Subheading>Hi{user && user.displayName !== null ? ' ' + user.displayName : ''}!</Subheading>
        <SettingsItem
          label="Dark theme"
          value={themeIsDark(theme)}
          onValueChange={() => toggleTheme()}
        />
        <Divider />
        {isLandscapeOnPhone && <TabsLinks navigationRef={navigationRef} />}
        <Divider />
        <Suspense fallback={<ActivityIndicator/>}>
          <Tags userId={user.uid} />
        </Suspense>
        <Divider />
        <Medications display='list' />
        <Divider />
        <Contacts display='list' />
      </ScrollView>
    )
  } else {
    // private view; should handle left column or full page
    return (
      <ScrollView style={styles.content}>
        {thumbnail ? (<Avatar.Image source={thumbnail} style={styles.image} />) : null}
        <Subheading>Hi{user && user.displayName !== null ? ' ' + user.displayName : ''}!</Subheading>
        <SettingsItem
          label="Dark theme"
          value={themeIsDark(theme)}
          onValueChange={() => toggleTheme()}
        />
        <Divider />
        {isLandscapeOnPhone && <TabsLinks navigationRef={navigationRef} />}
        <Divider />
        <Suspense fallback={<ActivityIndicator/>}>
          <Tags userId={user.uid} />
        </Suspense>
        <Divider />
        <Medications display='list' />
        <Divider />
        <Contacts display='list' />
        <Divider />
        <Button onPress={() => {
          fetching(true)
          refreshDataFromFirebase().finally(() => fetching(false))
        }} style={styles.button}>
          <Text>Refresh Data</Text>
        </Button>
        <Divider />
        <Button onPress={() => logout()} style={styles.button}>
          Sign Out
        </Button>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
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
    alignItems: 'center'
  }
});

export default Profile
