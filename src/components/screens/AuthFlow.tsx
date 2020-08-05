import * as React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Title, Button } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import {
  createStackNavigator,
} from '@react-navigation/stack';
import { User, auth } from 'firebase';
import { connect } from 'react-redux';
import { SignInAction, Action, SignOutAction } from '../../reducers/AuthReducer';
import { State } from '../../Types'

type AuthStackParams = {
  SignIn: undefined;
  Success: undefined;
};

/*const SplashScreen = () => {
  return (
    <View style={styles.content}>
      <ActivityIndicator />
    </View>
  );
};*/

const SignInScreen = (signIn: (user: User) => void) => {
  const { colors } = useTheme();
  const [email, onChangeEmail] = React.useState('Email');
  const [password, onChangePassword] = React.useState('Password');
  const [error, onChangeError] = React.useState('');

  return (
    <View style={styles.content}>
      <TextInput
        placeholder="Email"
        autoCompleteType="email"
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text },
        ]}
        onChangeText={onChangeEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text },
        ]}
        onChangeText={onChangePassword}
      />
      {error !== undefined ? (<Text style={{color: 'red'}}>{error}</Text>) : null}
      <Button mode="contained" onPress={() => {
        auth().signInWithEmailAndPassword(email, password).then((user) => {
          user.user && signIn(user.user)
        }).catch((e) => onChangeError(e))
      }} style={styles.button}>
        Sign in
      </Button>
    </View>
  );
};

const AuthenticationSuccessScreen = (signOut: () => void) => {
  auth().signOut().then(() => signOut)
  
  return (
    <View style={styles.content}>
      <Title style={styles.text}>Signed in successfully 🎉</Title>
      <Button onPress={signOut} style={styles.button}>
        Sign out
      </Button>
    </View>
  );
};

const SimpleStack = createStackNavigator<AuthStackParams>();

const SimpleStackScreen = (props: any) => {
  const {
    navigation,
    authenticated,
    isSignout,
    signIn,
    signOut
  } = props
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (authenticated) {
    navigation.popToTop()
  }

  return (
    <SimpleStack.Navigator>
      {authenticated ? (
        <SimpleStack.Screen
          name="SignIn"
          options={{
            title: 'Sign in',
            animationTypeForReplace: isSignout ? 'pop' : 'push',
            headerShown: false
          }}
          component={SignInScreen} // TODO pass into sub-component the signIn function
        />
      ) : (
        <SimpleStack.Screen
          name="Success"
          options={{ title: 'Authentication Success' }}
          component={AuthenticationSuccessScreen} // TODO pass into sub-component the signOut function
        />
      )}
    </SimpleStack.Navigator>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    margin: 8,
    padding: 10,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  button: {
    margin: 8,
  },
  text: {
    textAlign: 'center',
    margin: 8,
  },
});

// Map State To Props (Redux Store Passes State To Component)
const mapStateToProps = (state: State) => {
  // Redux Store --> Component
  return {
    authenticated: state.AuthReducer.user !== undefined,
    isSignout: true // TODO: make this tependant on the URL
  };
};// Map Dispatch To Props (Dispatch Actions To Reducers. Reducers Then Modify The Data And Assign It To Your Props)
const mapDispatchToProps = (dispatch: (value: Action) => void) => {
  // Action
  return {
    // Login
    signIn: (user: User) => dispatch(SignInAction(user)),
    signOut: () => dispatch(SignOutAction()),
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(SimpleStackScreen)