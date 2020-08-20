import React, { memo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Subheading, Avatar, Button, Divider, Text } from 'react-native-paper';

import SettingsItem from '../shared/SettingsItem';

import { connect } from 'react-redux';
import { Action } from '../../reducers';
import { SignOutAction, isUserAuthenticated, AuthState } from '../../reducers/AuthReducer';
import { State, RootDrawerParamList } from '../../Types';
import { ToggleThemeAction, ThemeState } from '../../reducers/ThemeReducer';
import { StackNavigationProp } from '@react-navigation/stack';
import { themeIsDark } from '../../reducers/ThemeReducer';
import { auth } from 'firebase';

const Profile = memo(
  (props: {
    authenticated: Boolean,
    user: AuthState['user'],
    theme: ThemeState['theme'],
    toggleTheme: () => void,
    signOut: () => void
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
          <Subheading>Hi{user ? ' ' + user?.displayName : null}!</Subheading>
          <SettingsItem
            label="Dark theme"
            value={themeIsDark(theme)}
            onValueChange={() => toggleTheme()}
          />
          <Divider />
          <Button onPress={() => auth().signOut().then(signOut)} style={styles.button}>
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

// Map State To Props (Redux Store Passes State To Component)
const mapStateToProps = (state: State) => {
  // Redux Store --> Component
  return {
    authenticated: isUserAuthenticated(state.user),
    user: state.user,
    theme: state.theme
  };
};// Map Dispatch To Props (Dispatch Actions To Reducers. Reducers Then Modify The Data And Assign It To Your Props)
const mapDispatchToProps = (dispatch: (value: Action) => void) => {
  // Action
  return {
    // Login
    signOut: () => dispatch(SignOutAction()),
    toggleTheme: () =>  dispatch(ToggleThemeAction())
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Profile)