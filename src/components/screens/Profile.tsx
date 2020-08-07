import React, { memo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Subheading, Avatar, Button, Divider, Text } from 'react-native-paper';

import SettingsItem from '../shared/SettingsItem';

import { connect } from 'react-redux';
import { Action } from '../../reducers';
import { SignOutAction } from '../../reducers/AuthReducer';
import { State, RootDrawerParamList } from '../../Types';
import { ToggleThemeAction } from '../../reducers/ThemeReducer';
import { StackNavigationProp } from '@react-navigation/stack';
import { Theme } from '@react-navigation/native';
import { auth } from 'firebase';

const Profile = memo(
  (props: {
    navigation: StackNavigationProp<RootDrawerParamList, "Another">,
    authenticated: Boolean,
    user: firebase.User | undefined,
    theme: Theme,
    toggleTheme: () => void,
    signOut: () => void
  }) => {
    const {
      navigation,
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
          <Subheading>Hi{user?.displayName ? ' ' + user?.displayName : null}!</Subheading>
          <SettingsItem
            label="Dark theme"
            value={theme && theme.dark ? true : false}
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