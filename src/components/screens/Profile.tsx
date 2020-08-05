import React, { memo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Subheading, Avatar, Button, Divider } from 'react-native-paper';

import SettingsItem from '../shared/SettingsItem';

import { connect } from 'react-redux';
import { Action } from '../../reducers';
import { SignOutAction } from '../../reducers/AuthReducer';
import { State } from '../../Types';
import { ToggleThemeAction } from '../../reducers/ThemeReducer';

const Profile = memo(
  (props: any) => {
    const {
      navigation,
      authenticated,
      user,
      theme,
      toggleTheme
    } = props
    const thumbnail = null //user !== null && user.photoURL !== null ? require(user.photoURL) : null;

    return (
      authenticated ? (
        <ScrollView style={styles.content}>
          {thumbnail ? (<Avatar.Image source={thumbnail} style={styles.image} />) : null}
          <Subheading>Hi{user?.displayName ? ' ' + user?.displayName : null}!</Subheading>
          <SettingsItem
            label="Dark theme"
            value={theme.dark}
            onValueChange={() => toggleTheme()}
          />
          <Divider />
          <Button onPress={() => navigation.navigate('AuthFlow', {action: 'SIGN_OUT'})} style={styles.button}>
            Sign Out
          </Button>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content}>
          <Button onPress={() => navigation.navigate('AuthFlow', {action: 'SIGN_IN'})} style={styles.button}>
            Sign In
          </Button>
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
    authenticated: state.AuthReducer.user !== undefined,
    user: state.AuthReducer.user,
    theme: state.ThemeReducer.theme
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