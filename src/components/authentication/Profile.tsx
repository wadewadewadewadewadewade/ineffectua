import React from 'react';
import { firebase } from '../../firebase/config';
import { ScrollView, StyleSheet, Dimensions, ScaledSize, View } from 'react-native';
import { Subheading, Avatar, Button, Divider, Text } from 'react-native-paper';
import SettingsItem from '../shared/SettingsItem';
import { NavigationContainerRef } from '@react-navigation/native';
import { connect } from 'react-redux';
import { isUserAuthenticated, AuthState } from '../../reducers/AuthReducer';
import { State } from '../../Types';
import { ToggleThemeAction, ThemeState } from '../../reducers/ThemeReducer';
import { themeIsDark } from '../../reducers/ThemeReducer';
import { signOut } from '../../middleware/AuthMiddleware';
import { ThunkDispatch } from 'redux-thunk';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableHighlight } from 'react-native-gesture-handler';

const TabsLinks = ({
  color,
  navigationRef
}: {
  color: string,
  navigationRef: NavigationContainerRef | null
}) => {
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
  authenticated,
  user,
  theme,
  toggleTheme,
  logout,
  navigationRef
}: {
  authenticated: boolean,
  user: AuthState['user'],
  theme: ThemeState['theme'],
  toggleTheme: () => void,
  logout: () => void,
  navigationRef: NavigationContainerRef | null
}) => {
  const thumbnail = null //user !== null && user.photoURL !== null ? require(user.photoURL) : null;
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
  const isLandscapeOnPhone = dimensions.width > dimensions.height && dimensions.height <= 420;

  React.useEffect(() => {
    const onDimensionsChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    Dimensions.addEventListener('change', onDimensionsChange);

    return () => Dimensions.removeEventListener('change', onDimensionsChange);
  }, []);

  return (
    authenticated ? (
      <ScrollView style={styles.content}>
        {thumbnail ? (<Avatar.Image source={thumbnail} style={styles.image} />) : null}
        <Subheading>Hi{user && user.displayName !== null ? ' ' + user.displayName : ''}!</Subheading>
        <SettingsItem
          label="Dark theme"
          value={themeIsDark(theme)}
          onValueChange={() => toggleTheme()}
        />
        <Divider />
        {isLandscapeOnPhone && <TabsLinks navigationRef={navigationRef} color={theme.paper.colors.text} />}
        <Button onPress={() => logout()} style={styles.button}>
          Sign Out
        </Button>
      </ScrollView>
    ) : (
      <ScrollView style={styles.content}>
        <Text>
          Sign In
        </Text>
      </ScrollView>
    )
  );
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

interface OwnProps {
}

interface DispatchProps {
  toggleTheme: () => void,
  logout: () => void,
}

const mapStateToProps = (state: State) => {
  return {
    authenticated: isUserAuthenticated(state.user),
    user: state.user,
    theme: state.theme
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, firebase.app.App, any>, ownProps: OwnProps): DispatchProps => {
  // Action
  return {
    toggleTheme: () => dispatch(ToggleThemeAction()),
    logout: () => {
      dispatch(signOut())
    },
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Profile)
