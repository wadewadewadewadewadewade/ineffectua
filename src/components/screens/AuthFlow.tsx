import * as React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Title, Button } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import {
  createStackNavigator, StackNavigationProp,
} from '@react-navigation/stack';
import { User, auth } from 'firebase';
import { connect } from 'react-redux';
import { SignInAction, Action, SignOutAction, isUserAuthenticated } from '../../reducers/AuthReducer';
import { State, RootDrawerParamList } from '../../Types'
import { SvgXml } from 'react-native-svg';
//import logoSvg from '../../../assets/splash.svg';

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

const SignInScreen = (props : { signIn: (user: User) => void }) => {
  const { signIn } = props;
  const { colors } = useTheme();
  const [email, onChangeEmail] = React.useState('Email');
  const [password, onChangePassword] = React.useState('Password');
  const [passwordConfirm, onChangePasswordConfirm] = React.useState('Password Confirm');
  const [error, onChangeError] = React.useState('');
  const [register, changeMode] = React.useState(false);

  return (
    <View style={styles.content}>
      <SvgXml width="200" height="200" xml={'../../../assets/logo.svg'} style={styles.logo} />
      <Text style={styles.description}>
        There are thousands of others around the world that also have invisible illnesses. Lupus,
        fibromyalgia, and many varieties of auto-immune diseases abound, just to name a few classes 
        of invisible illness.The intent of this app is to help people with chronic illnesses track 
        their medical issues and appointments, to help them feel a bit of control in their treatment.
      </Text>
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
        autoCompleteType="password"
        secureTextEntry
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text },
        ]}
        onChangeText={onChangePassword}
      />
      {register && (<TextInput
        placeholder="Confirm Password"
        autoCompleteType="password"
        secureTextEntry
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text },
        ]}
        onChangeText={onChangePasswordConfirm}
      />)}
      {error !== undefined ? (<Text style={{color: 'red'}}>{error}</Text>) : null}
      <Button mode="contained" onPress={() => {
        if (register) {
          if (password === passwordConfirm) {
            auth().createUserWithEmailAndPassword(email, password).then((user) => {
              user.user && signIn(user.user)
            }).catch((e) => onChangeError(e))
          } else {
            onChangeError('"Password" and "Confirm Password" values must match, so you know you\'re entering the password your\'e intending to enter')
          }
        } else {
          auth().signInWithEmailAndPassword(email, password).then((user) => {
            user.user && signIn(user.user)
          }).catch((e) => onChangeError(e))
        }
      }} style={styles.button}>
        <Text>Sign {register ? 'Up' : 'In'}</Text>
      </Button>
      {register ? (
        <Button mode="text" onPress={() => changeMode(false)}>
          <Text>Sign In To Existing Account</Text>
        </Button>
      ) : (
        <Button mode="text" onPress={() => changeMode(true)}>
          <Text>Create New Account</Text>
        </Button>
      )}
      <Text style={styles.smallprint}>
        We don't share your information with anyone. but we do use Firebase to 
        store your data...for now. The plan is to move to our own database eventually.
      </Text>
    </View>
  );
};

const AuthenticationSuccessScreen = (props: { signOut: () => void }) => {
  const { signOut } = props;
  return (
    <View style={styles.content}>
      <Title style={styles.text}>Signed in successfully 🎉</Title>
      <Button onPress={() => auth().signOut().then(() => signOut)} style={styles.button}>
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
  } : {
    navigation: StackNavigationProp<RootDrawerParamList, "Root"> | undefined,
    authenticated: Boolean,
    isSignout: Boolean,
    signIn: (user: User) => void,
    signOut: () => void
  } = props
  navigation && React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (authenticated && navigation) {
    navigation.popToTop()
  }

  return (
    <SimpleStack.Navigator>
      {!authenticated ? (
        <SimpleStack.Screen
          name="SignIn"
          options={{
            title: 'Sign in',
            animationTypeForReplace: isSignout ? 'pop' : 'push',
            headerShown: false
          }}
          children={() => <SignInScreen signIn={signIn} />}
        />
      ) : (
        <SimpleStack.Screen
          name="Success"
          options={{ title: 'Authentication Success' }}
          children={() => <AuthenticationSuccessScreen signOut={signOut} />}
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
  logo: {
    justifyContent: 'center',
  },
  description: {
    textAlign: 'left',
    margin: 8,
  },
  smallprint:{
    textAlign: 'left',
    margin: 8,
    fontSize: 10
  }
});

// Map State To Props (Redux Store Passes State To Component)
const mapStateToProps = (state: State) => {
  // Redux Store --> Component
  return {
    authenticated: isUserAuthenticated(state.user),
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