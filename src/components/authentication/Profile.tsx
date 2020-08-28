import React, { memo } from 'react';
import { firebase } from '../../firebase/config';
import { ScrollView, StyleSheet } from 'react-native';
import { Subheading, Avatar, Button, Divider, Text } from 'react-native-paper';
import SettingsItem from '../shared/SettingsItem';

import { connect } from 'react-redux';
import { Action } from '../../reducers';
import { isUserAuthenticated, AuthState } from '../../reducers/AuthReducer';
import { State, RootDrawerParamList } from '../../Types';
import { ToggleThemeAction, ThemeState } from '../../reducers/ThemeReducer';
import { themeIsDark } from '../../reducers/ThemeReducer';
import { signOut } from '../../middleware/AuthMiddleware';
import { ThunkDispatch } from 'redux-thunk';

const Profile = memo(
  (props: {
    authenticated: Boolean,
    user: AuthState['user'],
    theme: ThemeState['theme'],
    toggleTheme: () => void,
    signOut: () => void,
  }) => {
    const {
      authenticated,
      user,
      theme,
      toggleTheme,
      signOut
    } = props
    const thumbnail = null //user !== null && user.photoURL !== null ? require(user.photoURL) : null;

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
          <Button onPress={() => signOut()} style={styles.button}>
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
)

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
  signOut: () => void,
}

const mapStateToProps = (state: State) => {
  return {
    authenticated: isUserAuthenticated(state.user),
    user: state.user,
    theme: state.theme
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, any>, ownProps: OwnProps): DispatchProps => {
  // Action
  return {
    toggleTheme: () => dispatch(ToggleThemeAction()),
    signOut: () => {
      dispatch(signOut())
    },
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Profile)