import * as React from 'react';
import { View, TextInput, StyleSheet, Text, Keyboard } from 'react-native';
import { Title, Button } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import {
  createStackNavigator, StackNavigationProp,
} from '@react-navigation/stack';
import { connect } from 'react-redux';
import { isUserAuthenticated } from '../../reducers/AuthReducer';
import { authenticate, signOut } from '../../middleware/AuthMiddleware';
import { State, RootDrawerParamList } from '../../Types'
import { Svg, G, Path } from 'react-native-svg';
import { ThunkDispatch } from 'redux-thunk';

type AuthStackParams = {
  SignIn: undefined;
  Success: undefined;
};

const SignInScreen = (props: {
  auth: (email: string, password: string, errorCallback?: (e: any) => void, isCreation?: boolean) => void
}) => {
  const { auth } = props;
  const { colors } = useTheme();
  const [email, onChangeEmail] = React.useState('Email');
  const [password, onChangePassword] = React.useState('Password');
  const [passwordConfirm, onChangePasswordConfirm] = React.useState('Password Confirm');
  const [error, onChangeError] = React.useState('');
  const [register, changeMode] = React.useState(false);

  return (
    <View style={styles.content}>
      <Svg x="0px" y="0px" viewBox="0 0 1257.9464 221.08823" fill='#000' style={styles.logo}>
        <G transform="translate(-13.053608,-222.11178)">
          <Path d="M760,269.6c-0.1,3.4,0.3,6.9-0.5,10.2c-0.6,2.6,3.4,5.1,0,7.7c-0.1,0.1,1.6,3.4,3.1,4.5c2.2,1.7,5,2.7,7.4,4.2
            c0.4,0.3,0.3,1.4,0.5,2.1c-7.1,1-0.8,3.8-0.2,4.1c4.7,2.1,9.9,3,13.1,7.8c0.5,0.8,2.4,1.2,3.6,1c3.5-0.6,6.9,3.4,9.1,2.1
            c4.2-2.4,5.4,1.5,8,2.1c1.3,0.3,3-2.2,4.4,0.4c0.1,0.2,3-3.8,3.1,0.9c0,0.5,1.3,1.4,2,1.4c0.7,0,1.8-1,1.9-1.6
            c0.2-3.8,0.8-6.9,5.8-4.6c4-3.7,8-7.4,11.9-11.1c1.7-1.6,3.1-3.5,5.9-1c0.6,0.5,4.1-0.5,5.8-2.7c4.5-5.8,8.9-5.7,13.1,0.1
            c0.9,1.3,1.1,3.1,2.1,4.2c2.6,2.9,4.4,6.1,9.9,3c5-2.8,16.6,5.6,16.9,11.1c0,0.3-0.9,0.7-1.3,1.1c-2.8,2.3-3.2,3.9-0.6,5.1
            c4.5,2,7,6,10.3,9.1c1.3,1.3,2.4,2.9,0.5,4.1c-1.8,1.2-0.3,4.8-4.2,4.5c-4.4-0.4-8.3-1-11.7-4c-1.7-1.5-3.6-2.7-5.5-3.8
            c-4.1-2.2-6.1-2-8.1,2c-1.5,3.1-2.8,5-6.5,4.6c-0.6-0.1-1.2,0.3-1.8,0.6c-10.6,6.9-17.5,15.8-22.6,28.9c-3.3,8.5-1.4,14.1,6.7,18.8
            c4.3,2.5,9,4.6,13.2,7.4c2.3,1.5,5.2-1.3,6.9,1.5c8-2.9,15.8-2.3,23.9,0.6c2.7,1,6.2,1.3,9.5-1.2c2.4-1.8,5,0.3,4.9,3.5
            c-0.2,4,0.6,8.6-1,12c-3.2,6.9-8.8,12.2-16.4,14.4c-7,2.1-14.2,3.2-21.1,5.6c-3.3,1.2-5.4,2.8-8.8-0.3c-1.9-1.8-5.1,3.9-8.6-0.3
            c-1.7-2-6.1-2.7-9-2.3c-2.4,0.3-3.6-3.7-5.4-1.1c-0.5,0.7,1.8,3.1,2.6,4.8c0.2,0.5-0.1,1.9-0.2,1.9c-4.8,0.4-9.9,2.9-13.8-2.2
            c-1.3-1.8-2.1-2.2-4.5-0.6c-2.3,1.6-5.1-0.4-6.7-2.9c0-0.1,0-5,0-5.4c0.4-4.6,0.4-9.2-1.8-13.4c-0.4-0.9-2.7-1.6-0.6-2.7
            c0.5-0.3,2,0.9,2.8,1.7c0.6,0.5,0.8,1.5,1.1,2.2c0.3-0.6,0.8-1.1,0.9-1.7c0.2-1.7-0.2-3.5,0.3-5.1c2.8-8.5-3.9-11.6-8.8-15.6
            c-0.3-0.3-3.1,3.5-3-1c0.1-3.3,0.4-6.4-1.6-9.5c-1.3-2-2.6-5.7-1.7-7.1c3.6-5.7,3.5-13,8.3-18c0.2-0.2,0.5-0.5,0.7-0.7
            c3.7-3.8,6.3-7.9,7.9-13.3c0.4-1.5,0-3.2-0.1-4.8c-1.4,0.3-2.8,0.8-4.2,1c-4.5,0.5-8.6,3.1-13.4,2c-1-0.2-2.3-0.5-3-0.1
            c-7.2,4.6-15.1,3.6-23,3.2c-2.9-0.1-4.5,1.4-5.2,3.7c-1.1,3.7-1.6,7.5-2.5,11.3c-0.7,2.8-1.7,5.5-2.3,8.3c-0.6,2.9,0.1,6.5-1.4,8.7
            c-1.8,2.6,1.3,3,1,5c-1.3,7.5-1.1,15.3-3.3,22.4c-1.7,5.5-2,11.4-4.5,16.6c-2.3,4.8-5.8,9.1-8.2,13.9c-1.2,2.5-1.8,4.6-5,5.3
            c-2.3,0.4-3.7,2.3-4.1,4.9c-0.2,1.1-1.9,1.9-2.8,2.8c-0.3-1.2-0.8-2.3-0.9-3.5c-0.1-1.3,0.1-2.7,0.1-4.1c-0.1-5-2.1-0.9-3.3-0.6
            c-2.6,0.5-4.7-4.8-7.6-0.6c-0.4-0.7-1.2-1.3-1.2-2c0-2.7,0.2-5.4,0.2-8.2c0-1.3,0-3.2-0.7-3.6c-4.9-2.8-1.4-7-0.4-9
            c1.3-2.8,0.9-3.9-1-5.3c-0.6-0.4-5.5,3.1-5.5,3.9c0.2,2.6,0.5,5.2,0.7,7.8c0.2,1.8,1.1,4.2,0.3,5.5c-3.3,5.6-6.9,10.9-6.3,17.9
            c0,0.3-1.1,0.9-1.6,0.8c-0.8-0.2-2.1-0.7-2.3-1.3c-0.3-1.3-0.4-3.2,0.3-3.9c2.2-2,1.1-3.4,0.6-5.8c-0.7-3.4,1.4-7.2,2.3-10.9
            c0.1-0.3,0.5-0.5,0.7-0.7c2-1.9-0.5-5.7,3-6.9c-2.9-0.4-6.4-2-8.6-1c-2.6,1.2-5,1.1-7.5,1.6c-1.6,0.4-3.5,1.9-4.2,3.5
            c-0.4,0.8,1.2,2.9,2.3,4c1.1,1.1,2.6,2,4.1,2.3c1.7,0.3,4-3.7,5.2,0c0.6,1.6-1.1,4.1-2.1,6.1c-1.3,2.9-3.2,5.5-4.2,8.4
            c-1,3-2.2,2.4-4.2,1.2c-1.3-0.8-3.4-1.7-4.5-1.2c-9.4,4.3-19.3,3-29.1,3.1c-6.5,0.1-11.8-2.2-17.6-4.6
            c-9.4-3.8-15.2-10.4-18.8-19.6c-1.6-4-3.1-7.6-8.5-8.4c-4-0.6-5.1-3.7-3.3-7.5c2.4-5,4.5-10,4.1-15.8c-0.1-0.9,0.3-2,0.8-2.7
            c6.3-8.1,6.8-18.3,10.3-27.4c1-2.7,1.5-5.5,2.4-8.2c0.4-1.2,0.8-2.5,1.6-3.4c3.2-3.8,6.5-7.4,9.7-11.2c0.8-0.9,1-2.3,1.5-3.4
            c0.7-1.4,1.6-3.9,2.4-3.9c6.3,0.1,9.6-6,15.7-6.9c6.2-0.9,11.8-2.9,17.9,0.6c3.3,1.9,8.2-1.4,11.2,2.1c2.2,2.6,2.8,7.7,5.3,8.6
            c3.9,1.3,2.2,3.5,2.5,5.4c0.2,1.8,0,3.2-2.5,3.2c-2.5,0-16,0-17.3-1.3c-3.7-3.9-5.7,1.4-8.6,1.1c-4.6,7.6-10.9,14-13.4,22.9
            c-1.2,4.2-4.4,7.7-5.1,12.2c-1.3,8.8-3.2,17.4-0.5,26.6c3,10.3,10.2,14.4,19.3,17.2c2.4,0.7,4.9-0.1,7.6,1.7
            c4.2,2.9,8.5-2.4,13-1.3c0.1,0,0.4-0.4,0.6-0.7c-0.5-0.3-1.1-0.9-1.6-1c-3.4-0.2-6.8-0.2-10.2-0.5c-0.7-0.1-1.4-0.8-2.1-1.2
            c0.7-0.7,1.4-1.9,2.3-2c1.8-0.2,4.1-0.6,5.4,0.3c2.2,1.6,4,1.8,6.3,0.5c5.8-3.2,8.4-3.6,14.4-2.8c1.7,0.2,3.4,0.1,5.1,0.2
            c1.9,0.2,3,0,3.4-2.4c0.8-4.8-1.7-10.2,2.1-14.6c0.1-0.2-0.8-1.5-1.5-2.1c-1.6-1.4-2.4-3-2-5.3c0.2-1.2,0-2.7-0.6-3.8
            c-4-8.3-3.6-8.6-0.8-18.3c2-7.1,5-13.9,5.2-21.6c0.1-3.5,2.7-6.9,4.2-10.4c1.4-3.3,2.5-6.5,2.7-10.2c0.2-4.2,6.8-5.2,5.5-10.4
            c-3.9,2.4-8.2,1.1-12.3,1.2c-0.7,0-1.4-0.1-2-0.1c-1.6,0.1-3.3,0.2-4.9,0.3c0.4,1,0.8,1.9,1.1,2.9c0,0.1-0.4,0.6-0.7,0.7
            c-3,0.2-6.1-0.3-8.9,0.6c-3,1-4.2-1.5-6.4-2c-2.9-0.6-5.8-0.8-8.6-1.6c-0.7-0.2-1.6-2.2-1.3-3c0.4-1.1,1.8-2,2.9-2.8
            c5.8-4.2,11.4-8.8,17.6-12.2c5-2.8,11.2-3.8,13.1-10.4c0-0.1,1.6,0,2,0.4c2.6,2.9,2.3,5-0.4,6.9c-1.3,1-2.4,2.3-3.6,3.5
            c4.4-1.4,2.2,5.4,5.9,4.7c1.2-0.2,2.6-0.4,3.6-1c2.3-1.3,1.7,0.5,1.9,1.5c0.2,0.6,0.6,1.1,0.9,1.7c0.4-0.5,1.1-0.9,1.1-1.4
            c0.2-2.4,0.2-4.8,0.3-7.1c0-0.5,0.7-1,1.1-1.5c0.3,0.6,0.6,1.1,0.9,1.7c1.1,2.1,2.1,4.2,3.1,6.3c3.4-1.7,3-4.9,3-7.9
            c0.1-4.3,0-4.5-4.2-2.7c-2.5,1.1-3.8,1-3.8-2c0-1.4,0-2.7,0.2-4.1c0.1-0.5,0.7-1,1.1-1.4c0.3,0.6,0.9,1.1,0.9,1.7
            c-0.1,3.5,2.6,2.5,4.3,2.5c2.7,0,1.7-2.3,1.9-3.8c0.3-2.6,0-5,2.1-7.5c1-1.1-1.1-4.7-1.5-7.2c-0.3-1.7,0-1.7,2.3-0.5
            c0.4,0.2,1.6-0.3,1.7-0.7c1.1-5.9-2.2-10.7-5-15.1c-1.6-2.4-3.6-5-1.9-7c1.9-2.3,5.3-3.3,8.2-4.7c0.2-0.1,1.7,1.2,1.7,1.7
            c-0.4,5.2,5.2-2.6,4.9,2.2c0.5-1,1-2,1.3-3c0.2-0.6-0.1-1.5,0.1-2c0.5-1,1.4-2.7,1.9-2.6c1.1,0.2,2.4,1.1,3.1,2
            c0.6,0.9,0.9,3,0.5,3.3c-6.1,4.3-3.2,12.4-7.6,17.4c-0.1,0.1,2.1,2.3,3.3,3.6c0.7-0.9,1.7-1.6,2-2.6c0.4-1.3,0.1-2.7,0.3-4
            c0.1-0.5,0.8-0.8,1.2-1.2c0.3,0.6,0.7,1.1,0.8,1.7c0.1,0.7-0.2,1.4,0,2c0.3,0.8,0.8,1.6,1.3,2.3c0.9-0.6,1.8-1.3,2.7-1.9
            c0.9-0.6,1.8-1.3,2.7-2c0.5,1.1,1.3,2.2,1.3,3.2C760.4,262.2,760.1,265.9,760,269.6z"/>
          <Path d="M469.9,358.6c-1.7-0.1-3.4-0.1-5.1-0.2c-5.7-0.2-7.8,1.7-8.4,7.6c-0.2,2.4-0.3,4.8-0.2,7.1c0.1,2.8-0.2,5.4-3,7
            c-0.5,0.3-0.9,1.6-0.6,2.1c2.5,4.8,0.9,7.4-4.2,8.3c-1.1,3.3-2.6,6.5-3.3,9.9c-0.5,2.9-0.3,5.9-2.4,8.3c-3,3.3-2,7.4-2.5,11.3
            c-0.2,1.9-0.8,3.8-1.7,5.4c-0.9,1.5-2.4,2.3-4.2,0.8c-2.7-2.3-5.5-4.6-8.3-6.8c-1.9-1.4-2.7-3.6-1.7-5.3c3-4.8,2.4-10.5,4.3-15.7
            c1.9-5.1,1.6-11,3-16.3c0.8-3.1,1.1-7.1,2.6-9.1c2.7-3.6,4.5-7.7,7.2-11.3c0.7-0.9,2.1-1.6,3.2-2c3.9-1,0.5-2.7,0-2.9
            c-2.1-0.7-4.8-2-6.5-1.3c-10.6,4.4-20.7-0.2-31-1.2c-2.4-3.4-6.1-1.8-9.3-2.4c-2.2-0.4-4.5,0.4-6.6-1.6c-2-1.9-3-0.8-3.8,1.9
            c-2.8,10.6-7.6,20.7-7.2,32c0,0.5-0.6,1.1-0.9,1.6c-0.4-0.8-0.7-1.6-1.1-2.4c-0.3-0.6-0.6-1.1-1-1.7c-0.2,0.2-0.7,0.5-0.7,0.7
            c0.2,5.8-3,11.8,1.6,17.3c0.9,1.1,1.3,3,1.3,4.5c0.1,3.7,1.1,8.4-0.6,11c-2.5,3.6-2,7.1-1.9,10.5c0.1,3.8-1.5,7-2.6,10.3
            c-0.4,1-1.2,2.5-2,2.6c-2.7,0.3-2.1-1.9-2-3.5c0-2.7,0.2-5.4,0.3-8.2c0.2-5.2,0.7-10.3-2.5-15.2c-1.3-1.9-0.3-5.1-0.8-7.7
            c-0.5-2.8-1.1-5.8-2.5-8.1c-1.3-2.1,1.2-3.9-0.7-6.3c-1.2-1.5,3.5-4.5,1.6-7.9c-1.7-2.9,1.3-5.6,0.8-8.7c-0.5-3,0-6.1,0.2-9.2
            c0.2-3.2,4.1-6.4,2.1-9.1c-2.4-3.3,0.3-5.2,0.6-7.6c0.8-6.3-1.6-10-8.3-11c-5.8-0.8-9-5-12.6-8.8c-0.3-0.3-0.6-1.1-0.4-1.4
            c2.7-4.6,3-11.4,8.5-13.5c3.8-1.5,8.6-0.8,12.9-0.4c1.4,0.1,2.8,3.8,3.2-0.8c0.1-1.1,1.7-2,2-3.2c0.3-1.4-0.1-2.6-2-1.2
            c-0.4,0.3-1.9-0.2-1.9-0.3c0.7-5.7-2.2-10.6-3.6-15.8c-0.2-0.6,0.3-1.5,0-2c-1-1.8-3.2-3.7-3-5.3c0.6-3.3,1.7-7.1,3.9-9.5
            c2.2-2.4,6-3.3,9.2-4.8c5.7-2.8,11.3-5.4,18-5.9c3.4-0.2,7.1-4.2,9.6-7.4c1.7-2.1,6.3-2.7,4.5-7c3.5-4.7,8.6-6.9,13.9-8.6
            c1.7-0.5,4.1,1.4,6.2,2c2,0.5,5.2-1,4.6,3.3c0,0.2,0.4,0.7,0.7,0.7c8.3,0.9,7.2,9.2,10.7,13.8c2,2.7-2.2,5.9-0.1,9.4
            c1.7,3.1-2,5.9-2.4,9.1c-0.1,1-1.2,2.3-0.9,2.8c0.6,1,1.9,1.8,3.1,2.2c0.4,0.1,1.6-0.9,1.9-1.6c0.9-2,1.4-4.2,2.4-6.2
            c0.4-0.9,1.6-1.4,2.5-2.1c0.5,0.7,1.4,1.4,1.4,2.1c-0.1,1.9-0.1,4.1-1,5.7c-2.2,3.9-4.9,7.5-7.5,11.1c-1.2,1.6-2.8,1.8-4.2,0.1
            c-0.8-1-2.6-1.4-0.7-3.8c2-2.4,2.3-5.8-3-5.8c-1.3,0-2.8-1.6-3.8-2.8c-0.8-0.9-0.7-2.5-1.4-3.4c-4.8-5.7-10.6-5.8-14.7,0.2
            c-4.6,6.8-9.6,13.4-12.4,21.3c-0.9,2.7-1.7,5.5-2.5,8.2c-0.4,1.5-1.4,3.3-1,4.6c0.4,0.9,3.1,0.7,4,1.7c3.7,4.4,8.5,4.3,13.5,4.6
            c4.6,0.2,7.4,3.9,10.1,7.2c1.4,1.6,2.4,0.8,2.9-0.3c3.6-7.6,8.8-5.4,14.2-2.6c0.6,0.3,1.2,0.7,1.7,0.7c1.9,0.1,3.6,0.7,4.2-2.5
            c1-4.9,6.2-8.6,4.4-14.5c6.5-3.9,4.1-13,10-17.2c0-5.4,6.6-7.5,6.8-11.2c0.3-5,6.8-6.3,5-11.4c2.4-1,2.3-4.8,6.5-4.1
            c6.9,1.1,8.5,1.3,10.4,5c0.9,1.7,1.8,3.4,2.7,5c1.4,2.5,0.6,3.6-2.2,3.7c-0.5,0-1.4,1.4-1.3,2.2c0,0.6,1,1.5,1.7,1.8
            c2.7,0.9,5.5,1.6,8.2,2.4c0.6,0.2,1.2,0.4,1.7,0.8c5.2,4.3,5.3,4.3,6.4-2.4c0.4-2.4,2.1-2.9,3.4-1.8c2.4,2.2,5.1,4.1,4.8,8.3
            c-0.3,3.8,2.7,7.4,1.5,11.5c-0.2,0.6-0.1,1.5,0.3,1.9c7.4,7.2,2,13.6-1,20.3c-0.7,1.5-0.9,3.2-1.3,4.8c-0.1,0.7-0.1,1.4-0.1,2.1
            c-0.7,0-1.7,0.2-2-0.2c-1.7-2-3.8-3.9-4.8-6.2c-2.4-5.5-5.1-10.4-11-12.9c-1.1-0.5-1.3-3.4-2.3-3.6c-1.2-0.3-2.8,1.5-4.3,1.6
            c-3,0.2-6.1,0.1-9.2-0.3c-3.4-0.5-5.6,0.8-8,3.1c-5.2,5-4.5,8.2,2.6,11.1c3.5,1.4,7.1,2.6,10.3,4.5c2.7,1.6,4.2,4.2,2.4,7.7
            c-0.7,1.4-1.8,3.1-1.6,4.4c1.5,7.1-3.3,12.4-5.1,18.5c-0.7,2.5-4.2,3.5-7.1,3.6C476.7,359,473.3,358.8,469.9,358.6z"/>
          <Path d="M1225.9,321.2c-0.3,9.6-0.2,9.8-8.3,14.3c-1.7,1-2.4,1.4-2.6,3.2c-0.7,6.6,1.6,12.9,2.4,19.3c0.5,3.7,2.5,7.4,2.6,11
            c0.1,6.7,6.8,9.3,8.1,15.2c0.1,0.5,1.8,1,2.6,0.9c2.9-0.6,5,1.1,7.2,2.4c0.9,0.5,2,2.5,1.9,2.5c-4.7,4.1-0.5,6.4,1.9,8.8
            c2.3,2.3,5.1,4,7.5,6.1c4,3.4,9,6.3,11.5,10.7c2.6,4.5,6.3,7.6,9.3,11.6c0.3,0.5,0.6,1,1,1.5c-0.6,0.2-1.2,0.8-1.7,0.7
            c-5.3-0.6-10.6,3.9-15.4,1.3c-5.4-2.9-11.6-0.7-16.8-4.2c-2.3-1.6-6.3,1.8-9.4-0.5c-0.1,0.6-0.6,1.6-0.4,1.9c1.3,1.7,0.4,2.6-1.1,2
            c-3-1-5.8-2.5-8.6-3.9c-3.1-1.5-6-3.8-9.2-4.6c-3-0.8-2.1,1.1-0.7,2.5c-0.6,0.4-1.1,1.2-1.8,1.3c-3.2,0.5-5.8-1.3-5.7-4.1
            c0.1-4.7-7-2.9-6.2-7.7c0-0.1-0.9-0.3-1.4-0.4c-1.1,5-8.8,0.9-9.4,6.8c-3.1-0.1-3.3,3.7-5.3,4.2c-2.7,0.8-5.9-0.7-8.4,1.9
            c-0.2,0.2-1.3-0.1-1.8-0.5c-1.8-1.3-2.6-4.3-5.5-3.8c-2.6,0.5,1.2-6-3.7-2.9c-1.7,1.1-4.5,0.4-6.8,0.4c-2.4,0-4.8-0.1-7.1-0.2
            c-0.7,0-1.4,0.1-2-0.1c-0.6-0.2-1.1-0.6-1.6-0.9c0.5-0.4,0.9-1,1.4-1c1-0.1,2.2,0.3,3,0c2-0.8,3.8-1.9,5.7-2.9
            c-2.1-1.6-4.1-1.6-6.3,0.1c-3.3,2.4-8-1.5-11.3,2.3c-0.2,0.2-2.7-1.3-3.9-2.3c-0.2-0.2,1.1-1.8,1.1-2.7c0.1-1.9,0.9-3.9-1.1-5.6
            c-1.7-1.5-2.5-2.1-2.8,0.8c-0.1,0.6-0.6,1.1-1,1.6c-0.3-0.5-1-1.1-1-1.5c0.5-3-0.5-6-3.2-6.5c-3.2-0.6-3-2.4-2.5-4.2
            c0.6-2.1-2.2-5.7,2.6-6.4c1-0.1,1.7-2.3,2.5-3.6c2-3.3-4.7-2.4-2.9-5.8c0.1-0.1-0.4-0.5-0.7-0.7c-0.4,0.8-0.7,1.7-1.2,2.5
            c-0.3,0.5-0.7,0.9-1.1,1.4c-0.3-0.6-0.9-1.2-0.8-1.7c0.3-1.5,0.7-3.1,1.5-4.3c0.5-0.9,2.3-1,2.7-1.9c4-7.9,10.3-13.3,17.6-18
            c3.1-2,6-5.2,7.4-8.5c3.5-8.3,8.8-15.5,14.1-22.5c3.3-4.4,8.2-7.1,13.9-8.5c5.8-1.4,11.4-4.1,17.3-4.7c4.8-0.6,11.7-3.9,13.7,4.9
            c0.1,0.4,2.3,0.8,3.3,0.6c2.4-0.6,4.7-2,7.1-2.5c2.9-0.5,6.3-1.2,8.7-0.1C1226.2,316.5,1225.9,320.7,1225.9,321.2z M1176.3,398.4
            c0.2,0,0.4-0.1,0.6-0.1c-1.4-6.9-2.9-13.7-4.3-20.6c-0.6,0.3-1.2,0.6-1.7,1c-0.5,0.6-0.9,1.4-1.3,2.1c-0.3-0.6-0.8-1.2-0.7-1.7
            c0.3-1.5,1.1-3,1.4-4.5c0.5-2.2,1.2-4.6,0.8-6.8c-0.3-1.8-4.9-0.7-3.9-4.4c-0.7,0.1-1.7-0.1-2.1,0.3c-2.3,2-4.5,4.1-6.7,6.2
            c-1.1,1.1-7.2,11.5-7.7,13.1c-0.9,3.3-1.4,6.6,1.8,9c1.5,1.2,3,1.3,3.7-1.1c0.2-0.7,0.9-1.3,1.3-2c0.2,0.6,0.8,1.2,0.7,1.7
            c-1.1,5.1,0.7,8.2,5.1,11.1c4.3,2.8,2.2-1,2.7-2c0.4-0.8,0.8-1.7,1.1-2.6c0.3,0.9,0.6,1.8,0.9,2.7c0.9,2.1,1.3,1.4,2.1-0.2
            c0.9-1.8,1.2-1.7,2-0.3c0.5,0.8,0.7,1.8,1.3,2.5c0.5,0.6,1.4,0.9,2.1,1.3c0.2-0.6,0.5-1.2,0.6-1.8
            C1176.3,400.4,1176.2,399.4,1176.3,398.4z"/>
          <Path d="M1034.6,435.5c-6.2-1.9-14.6,2.2-22-2.8c-6.1,5-9.2-4.6-14.6-3c-2.3-3.2-6.3-5.1-6.9-9.5c-0.1-0.6-1.3-1.1-1.3-1.5
            c0.7-3.7-1.5-7-1.7-10.4c-0.1-2.9-0.5-5.1-2.8-7.1c-2.2-2,3.7-5.1-0.8-7.1c0.4-0.4,1-1.2,1.1-1.2c3.8,2.5,9-0.4,12.4,3
            c2.3,2.3,2.4,1,2.6-1.1c0-0.3-0.1-0.7,0.1-1c0.9-1.8-3.8-3.7,0.1-5.5c-2.6-3.3-3.6-7.4-4.4-11.3c-1.5-7.8-6.3-13.4-11.6-18.8
            c-2.2-2.2-1.7-3.6,2-4c2.8-0.3,4-2.2,5.7-3.6c1.6-1.3,2.9-3.7,4.5-4c5.2-0.7,3.3-3.6,2.6-6.3c-0.4-1.5-0.9-3.1-1-4.7
            c-0.2-2.7,0.1-5,3.2-1.6c1.5-2.1,3-4.2,4.6-6.2c0.5-0.6,1.4-0.8,2.2-1.2c0.2,0.6,0.4,1.2,0.5,1.8c0.1,0.7,0.1,1.4-0.1,2
            c-0.4,2-1.5,5.5-1.1,5.6c4.4,1.8,2.5-3.5,4.9-4.7c1.5-0.8,1.6-3.9,2.6-5.9c0.8-1.7,2-4.7,2.9-4.6c3.9,0.1,4.9-4.1,4.8-5
            c-0.7-6.3,4.6-5.3,7.6-6.6c4-1.8,4.2-1.4,3.5,3.4c0,0.3,0,0.7,0,1c-0.5,5.1,4.6,10.4,0.6,15.1c-3.6,4.2-3.3,9.6-5.4,14.2
            c-2.3,5.1,1.7,10.7,1.8,16.2c0,1.5,1.4,3.1,1.2,4.5c-1.8,10.1,4,18.1,8.2,26.1c2.4,4.7,8.7,7.4,13.5,10.7c0.5,0.4,3.4-1.2,3.4-1.9
            c0.3-4.7,1.8-8.7,4.7-12.5c1.6-2.1,1.3-5.7,2.8-8c1.5-2.1,1.8-5.8,5.7-5.6c1.6-4.1,3.5-8.1,4.7-12.3c0.7-2.5,0.8-5.2-3.1-5.8
            c-1-0.1-2.5-1.9-2.5-2.9c0-6.5-0.8-13.4,5.1-18.3c3.2-2.7,7.3-4.6,9.8-7.8c2.2-2.8,4.9-3.2,7.4-4.6c2.8-1.6,2-6.2,5.8-7.9
            c2.9-1.4,5.3-4,7.7-6.4c1.9-1.8,3.5-1.9,4.9,0.3c2.8,4.3,5.2,2.4,7.9-0.2c0.6-0.6,2.3-0.3,3.4-0.4c-0.4,0.7-0.7,1.6-1.2,2.1
            c-1.5,1.4-2.1,3-2.8,5c-1.8,4.7-4.5,9-7.7,13.1c-3.9,4.9-6.6,10.7-9.2,16.4c-0.7,1.5,1.5,4.1,1.5,6.3c0.1,4.7-0.3,9.5-0.4,14.3
            c0,0.9,0.4,1.8,0.7,2.7c0.4-1,1-2,1.3-3.1c0.6-2.5-1-5.5,1.9-7.4c0.5-0.4,1-0.9,1.5-1.3c0.3,0.6,1,1.2,0.9,1.7
            c-0.8,3.8,1.5,8.1-2.1,11.5c-0.9,0.9-0.6,3.3-0.4,4.9c0.4,3.7-1.5,6-3.6,8.8c-4.2,5.5-7.3,11.8-10.8,17.8c-0.2,0.3,0.5,1.7,0.7,1.7
            c4,0,1.9,4.3,4.1,5.6c-1.8,2.2-3.3,4.9-5.5,6.6c-1.9,1.5-4.5,2.2-6.9,2.9c-2.6,0.8-1.1,5-5,5.3c-1.7,0.1-2.9,3.9-4.7,5.7
            c-5.9,6-12.6,10.2-21.6,9.5C1047.1,435.8,1041.6,435.8,1034.6,435.5z"/>
          <Path d="M108.4,387.2c0.1-2.7,0.1-5.4,0.3-8.2c0.3-4.7-1-10.4,1.3-13.8c3.4-5.1,9.3-8.4,14.1-12.6c1.4-1.2,3-2.4,3.9-4
            c5.1-9,10.1-18.2,13.3-28.1c0.5-1.5,1.4-2.8,2.2-4.2c4.7-7.7,6.4-16.4,9.1-24.9c1.2-3.9,2.5-7.9,4.6-11.3c1.4-2.4,3.8-4.9,6.3-5.6
            c5.8-1.7,9.6,1.8,9.8,8.1c0,2.4,0.1,4.8-0.3,7.1c-0.8,5,0,5.9,5.1,5.5c3.4-0.2,6.8,0.2,10.2,0.3c2.4,0.1,4.8,0.5,7.1,0.2
            c2.8-0.4,5.8-4.3,8-2.5c5.3,4.2,12.5,6.2,16,12.6c2.3,4.1,3.9,8.6,6.1,12.8c3.2,5.9,2.9,13,7.1,18.5c-1.1,8.6,0.7,17.3-2.3,25.8
            c-2.8,7.8-4.5,15.9-6.7,23.9c-0.1,0.3-0.7,0.6-0.7,0.7c5,7.5-1.9,11.5-4.6,16.9c-2.6,5.1-5.8,9.9-8.1,14.9
            c-3.6,7.8-10.9,9.6-17.3,13.1c-0.3,0.2-2.1-1.4-2.2-2.2c-0.8-9.7,2.6-18.3,6.6-27c2.4-5.1,5.5-10.2,5-16.4c-0.1-0.7-0.1-1.9,0.1-2
            c5.5-1.3,6.5-5.2,6.9-10.3c0.3-3.9,2.2-8,4.2-11.5c1.5-2.5,2.2-3.6-1.3-3.9c-0.3,0-0.4-0.5-0.7-0.7c-1.9-1.1-3.8-2.2-5.7-3.3
            c-2.1-1.2-5.9-2.5-5.9-3.8c0-5.6-3.2,0.8-4.3-1.5c-2.5-5.4-9.3-2.1-12.8-5.7c-10.3-1.4-20.1,0.5-29.8,3.8
            c-0.8,0.3-11.2,8.1-11.6,8.9c-0.6,1.1-1.4,2.4-1.3,3.5c0.5,7.1-5.5,12.5-4.8,19.6c-5.2,4.7-5.8,11.9-9.7,17.3
            c-1.4,2-3.4,4.6-3.2,6.7c0.4,4.7-2.7,6.6-5.4,9c-0.8,0.8-2.1,1.8-2.9,1.6c-1.5-0.3-3.5-1.1-4-2.2c-1.2-2.5-2.1-5.4-2.1-8.2
            C107.7,398.7,108.2,393,108.4,387.2z"/>
          <Path d="M568.3,435.6c-2.4-0.1-5.1-0.9-7-0.1c-2.5,1.2-3.4-4.5-5.7-0.9c-5.2-5.1-14.2-3.9-18.1-11.7c-1.3-2.6-6-3.4-8.6-5.6
            c-2-1.7-5.8-1.9-5.5-5.7c-3.2,3.4-4-0.8-5.7-1.9c-1.6-1-3.2-2-4.8-3c-0.8-0.5-1.5-2.8-2.6-0.5c-0.3,0.6,0.9,2,1.7,2.8
            c0.9,0.9,2.1,1.4,3.1,2.2c0.3,0.3,0.4,0.9,0.6,1.4c-0.6,0.2-1.4,0.7-1.8,0.5c-4.3-2.7-8.5-5.6-12.7-8.5c-1.9-1.3-0.2-2.4,0.7-2.8
            c3.7-1.4,4.8-3,1.2-5.8c-1.1-0.8-1.8-2-2.8-2.9c-2.7-2.6-5.4-5-1.6-8.9c0.6-0.6-0.1-2.5-0.3-3.8c-0.6-3.2-0.5-3.2,2.9-3.3
            c1,0,2.4-0.4,2.8-1.1c0.4-0.6-0.1-2.2-0.7-2.8c-2.6-2.3-2.8-4.3,0.1-6.5c1-0.7,1.9-2,2-3.1c0.6-7.6,2.3-12.8,5.4-17.6
            c1-1.5,0.9-3.8,1.8-5.4c1-1.8,2.6-4.7,4-4.7c5.2-0.2-1.9-3.7,1.5-4.4c2.1-0.5,3.8-2.4,5.8-3.3c1.6-0.8,3.2-0.7,3.4,1.8
            c0,0.5,0.9,1,1.4,1.5c3-3.5,5.9-7,9-10.4c2-2.1-3.6-3.3-0.4-5.8c1.2-0.9,0.8-3.8,1.8-5.3c1.3-1.9,3.7-3.1,5.1-5
            c4.1-5.8,4.3-5.9,8.5,0.2c1.4,2.1,2.6,4.4,4.1,6.5c2.7,3.6,2.7,3.5,0.1,7.2c-1.6,2.3-0.9,3.6,1.9,3.8c1.1,0.1,2.1,0.8,3.2,1.3
            c-0.9,0.2-1.8,0.4-2.7,0.8c-1,0.4-2,0.8-3,1.2c0.9,0.3,2.6,0.6,2.6,0.8c-0.2,1.6-0.2,4-1.2,4.7c-2.3,1.5-5,2.8-7.7,3.1
            c-7.5,0.8-12.4,4.8-15.8,11.3c-0.8,1.5-2.6,3.5-0.8,3.9c1.9,0.4,3,3.7,5.6,1.7c0.7-0.5,1.9-0.4,2.7-0.8c1.6-0.9,2.8-3.4,4.9-1
            c0.1,0.2-1.7,2.5-3,3.3c-1.6,0.9-3.5,1.3-5.4,1.7c-1.5,0.3-3.6-0.7-3.6,2c0,0.6,0.4,1.2,0.7,1.7c2.3-1.4,3.4,4.2,5.5,1.1
            c2.6-3.7,7.5-1.7,10.3-5.2c2.3-2.9,4.8-6.5,9.3-7.1c0.3,0,0.4-0.9,0.7-1.4c-0.6-0.2-1.2-0.4-1.8-0.7c-1.1-0.6-3.4,1.2-3.3-1.7
            c5.1,0.2,2.9-6.8,7.9-7.7c4.1-0.8,7.8-4.2,11.5-6.6c0.3-0.2,0.1-1.6-0.3-2.1c-4.2-4.4-5.4-6.7-4.4-10.2c0.7-2.3,1.5-5.4,5.2-2
            c1.4,1.2,4.6,0.2,7,0.5c1.3,0.2,3.6,1.4,3.7,1.2c1.4-2.4-1-3.5-2.2-4.9c-0.3-0.4-1.2-0.3-1.8-0.5c-6.5-2.6-7.6-4.3-3.1-8.4
            c4.4-4,5-9.6,8.3-13.8c2-2.4,3-2.7,4.9-0.2c2.3,3.1,1.4,5.4-2.8,6.2c-2.4,0.4-2.8,1.6-2,3.3c1,2.3,2.7,4.4,3.4,6.8
            c0.4,1.2-0.6,3-1.4,4.2c-0.4,0.6-3-0.8-2,1.6c0.4,1.1,1.8,2.1,2.9,2.4c0.6,0.2,2.1-1.1,2.4-2c1-2.7,1.6-5.5,2.4-8.2
            c0.2-0.6,0.7-1.1,1-1.6c0.3,0.5,0.9,1,1,1.6c0.3,2.7,4,5.1,1.3,8.1c-2.5,2.8-2.2,5.2,0.3,7.7c-2.1,2,4.1,3.6,0.3,5.7
            c1.2,1.1,3.1,1.9,3.3,3.2c0.5,2.3,0.2,4.8-0.1,7.1c-0.6,3.5-1.3,6.9-2.4,10.3c-1,3.2,2.8,6.4-0.2,9.6c-0.4,0.4,0.2,1.6-0.2,1.9
            c-5.2,4.6-5.6,12.1-10.5,17.1c-4.9,5-11.5,9.6-18.1,10.6c-5.6,0.9-11.2,2.3-16.8,3.5c-0.9,0.2-2.6,0.6-2.6,0.9
            c-0.1,2.7-1.3,4-3.6,2.4c-0.8-0.6-0.6-3.1-0.4-4.6c0.2-1.2,1.4-2.1,1.9-3.3c0.2-0.4-0.5-1.5-0.8-1.6c-0.9-0.1-1.9,0.1-2.7,0.4
            c-0.4,0.2-0.3,1.2-0.5,1.8l-4,2.3c-1.9,0.4-3.7,0.8-5.6,1.2c0.3,0.6,0.4,1.4,0.8,1.8c0.7,0.6,1.5,0.8,2.3,1.2
            c-0.9,0.3-1.8,0.6-2.7,0.8c-0.9,0.2-1.9,0.3-2.9,0.4c0.4,0.7,0.5,1.7,1.1,2.2c1.4,1.3,3.3,3.7,4.5,3.4c4.5-1.1,5.9,2.6,8.2,4.7
            c2.1,2,3.6,4.2,7,5c1.7,0.4,6.5,1.2,4.7,5.9c-0.1,0.2,1.7,1.4,2.7,1.8c1.8,0.7,4.1,0.6,5.4,1.7c2.4,2,6-1,7.9,2.5
            c1.4,2.6,3.6,4.6,5.1,7.2c0.9,1.7,1.1,3.8,1.7,5.7c-4.2-1.9-2.5,6.7-7.5,4.1C572.8,435.1,570.4,435.7,568.3,435.6z M583.5,337.2
            c-0.5-1.6-0.9-3.1-1.4-4.5c-0.3-0.8-1-1.6-1.5-2.4c-0.8,0.9-1.5,1.8-2.3,2.8c1.9,1.3,1.2,2.3-0.2,3.6c-2.4,2.1-4.4,4.2-4.9,8.1
            c-0.4,3-4,5.6-6,8.4c-0.3,0.4,0,1.3,0.1,1.9c0.7-0.1,1.6-0.1,2.1-0.5c4.2-2.8,6.3-7.6,10.8-10.4
            C582.1,343.1,582.6,339.4,583.5,337.2z"/>
          <Path d="M340.8,340.5c1.8,8-2.5,15.1-9.4,21c-9.1,7.8-8.8,12-25,16.1c-6.1,6.5-13.8,3-20.9,3.3c-3.5,0.1-4.8-2-5.3-5.6
            c-0.8-6.5,2.3-12.1,3.3-18.2c0.4-2.7,1.8-5.9,3.9-7.4c3.5-2.5,8.2-3.3,11.8-5.7c2.2-1.5,4.7,2.3,6.1-1c3.1,2.2,6.3,2,9.5,0.3
            c3.2-1.6,4.5-6,8.8-6.1c0.2,0,0.8-2.7,0.3-3.2c-3.8-4-6.8-8.7-13-10.1c-5-1.1-7.7-6.1-11.1-9.6c-3.4-3.4-4.7-2.7-7.9,1
            c-4,4.8-3.7,10.8-5.9,16c-1.7,4.1-0.6,9.8-3,13c-3.1,4.1,0,9.3-3.8,13c-1.3,1.2-0.4,4.5-0.7,6.8c-0.4,2.9-1,5.8-1.5,8.6
            c-0.4,2.4,3.2,5.3-1.1,7.1c0.5,5.6,1.1,11.9,6.2,14.6c6.4,3.4,11.3,8.4,17.1,12.4c0.8,0.5,1.6,1.1,2.5,1.3
            c5.8,1.8,7.2,7.8,11.1,11.5c1,0.9,2,4.5-1.8,5.2c-2.2,0.4-4.2,1.6-6.4,1.7c-3.4,0.1-6.1,1.1-8,3.9c-0.4,0.6-1.3,1.5-1.5,1.5
            c-5.2-3.4-11.1-1.6-16.7-2c-6.2-0.5-12.9-3.2-17.8-7c-3-2.4-5.4-4-4.5-8.4c0.8-3.5-0.4-7.3,3.4-10c2-1.4,4.3-4,4.4-6.1
            c0.1-3.8,5.3-6.4,1.8-11.4c-2.1-3-1.3-8.1-1.9-12.3c-0.5-3.5-1-7-2.1-10.3c-1-2.9-5.3-2.6-6.3-6.5c-0.7-2.7-2-3.3,1.6-4.9
            c1.9-0.9,6-4.3,2.3-8.5c-0.8-1-0.3-3.2-0.3-4.9c0-5.9,3.8-11.3,2.6-17.4c4.1-3.8,3.2-10.5,8.1-14c1.4-1,2.3-3.1,2.7-4.9
            c2.6-11.2,12-18,17.4-27.3c0.4-0.6,2.1-1.3,2.4-1c3.8,3.4,10.9,1.8,12.7,8.5c0.5,1.7,2.6,3.9,4.2,4.1c3.4,0.4,2.8,2.4,2.5,4.3
            c-0.4,3.1,1,4.9,3.5,6.4c2.2,1.2,4.5,4.3,6.3,3.9c2.5-0.5,4.2-0.2,6.6,0.4c7.1,1.8,8.3,2.9,8.6,10.5c0.1,4.7,1.3,8.8,3,12
            c0.7,1.4,1.3,3,1.3,4.5C341.3,332.7,341,335.8,340.8,340.5z"/>
          <Path d="M982.8,338.2c-2.9-0.6-5.8-1.2-8.6-1.8c-2.1-0.4-5.8,1.4-6.2,3.2c-1.6,6.5-3.2,13.1-4.8,19.6c-0.4,1.5-0.6,3.3-1.4,4.5
            c-2.6,3.7-3.3,7.7-3.2,12c0.2,5.6-3.7,10.6-2.7,16.4c0.4,2.1-1.1,1.6-2.2,0.4c-1.5-1.4-3.3-1.6-3.7,0.7c-1.5,9.2-8.1,16.5-9.3,25.8
            c-3.6,2.9-1.4,6.9-2.3,10.4c-0.2,0.9-0.7,1.7-1.1,2.6c-0.5-0.5-0.9-1-1.4-1.5c-0.9-0.9-1.9-1.6-0.3-3c0.8-0.7,0.9-2.4,0.9-3.6
            c0-0.7-0.8-1.6-1.4-2.1c-0.4-0.3-1.5-0.1-1.8,0.3c-0.7,1-1.1,2.2-1.6,3.4c-0.9-0.4-2.5-1.4-2.7-1.2c-0.8,0.9-0.9,2.5-1.7,3.2
            c-1.2,1-3,1.2-4.1,2.2c-1.7,1.6-3.1,3.6-4.6,5.4c-0.1-2.6-0.3-5.3-0.3-7.9c0-2.4-0.5-6.5,0.4-6.8c7.9-3.2,4-9.9,4.1-14.6
            c0.1-7.4,3.3-14.2,3.2-21.5c0-0.5,1.4-1.5,2-1.4c1.3,0.1,3.2,1.5,3.7,1.1c1.4-1.2,2-3.3,3.2-4.6c0.9-1,4,0.1,3.3-2.4
            c-1.1-4.2,3.2-3.3,4.3-5.2c1.2-2.2,1.6-4.8,2.4-7.2c0.3-0.8,0.4-0.8,2,1.2c0.3,0.4,0.8,0.8,1.1,1.2c0.3-0.6,0.5-1.1,0.9-1.7
            c1.7-2.4-3.1-4.3-0.4-6.7c-2.2-3,1.2-5.3,1.1-8.2c-0.2-2.4-3.2-4.9-0.1-7.7c0.5-0.5-0.9-3.5-1.8-5.1c-0.3-0.6-2.1-1.3-2.5-1
            c-2,1.4-4,2.2-6.4,1.8c-0.3,0-1.5,1.9-1.2,2.2c3.1,4.3,1.9,9.1,1.3,13.6c-0.9,7.3-4.2,14.2-4.7,21.6c0,0.3-1,0.8-1.3,0.7
            c-0.6-0.3-1-0.9-1.4-1.4c-0.4-0.5-1.1-1.4-1-1.4c3.3-2.9-1.9-5.8,0.1-8.6c0.5-0.8,0.6-2,1.3-2.5c3.6-2.3,2.1-4.9,1.4-8.2
            c-0.9-4.5,0.1-9.5,0.2-14.2c0-0.6-0.4-1.2-0.7-1.7c-0.4,0.7-1.2,1.3-1.3,2c-0.3,3-0.3,6.1-0.6,9.1c0,0.3-1.1,0.7-1.6,0.7
            c-0.6,0-1.6-0.3-1.7-0.6c-0.8-2.7-1.7-5.4-2.2-8.2c-0.6-3.8,3-4.9,5-7c1.3-1.3,1.1-1.9-0.1-3c-3.7-3.2-7.5-6.4-11.1-9.8
            c-2.7-2.6,0.3-1.7,1.4-2.4c3.7-2.2,0.3-3.7-0.8-5.4c-0.5-0.7-0.8-1.5-1.2-2.2c0.9-0.2,2-0.6,2.8-0.4c2.5,0.6,4.9,1.4,7.2,2.3
            c0.6,0.2,1.1,0.7,1.6,1c-0.9,0.3-1.8,0.6-2.6,1c-0.5,0.2-0.9,0.7-1.4,1.1c1.5,1.8,3,3.9,5.8,3.1c0.9-0.3,1.5-1.5,2.2-2.4
            c0.2-0.2,0.1-0.7,0-1c-0.8-3.5,2.9-6.8,2-9.2c-1.3-3.5-6-0.8-8.9-2c-1.2-0.5-2.2-1.3-3.3-2c-0.5-0.3-1.1-0.7-1.6-1.1
            c0.5-0.3,1.1-0.9,1.6-0.9c2,0,4.1,0,6.1,0.2c2.5,0.2,2.5-1.4,2.6-3.2c0.2-2.1-0.5-3-2.7-3.1c-1,0-2-0.8-3-1.3
            c0.9-0.2,1.9-0.4,2.8-0.7c2.7-0.8,7.1,2.7,7.7-3.2c1.6,0.6,3.6,0.8,4.8,1.8c1.5,1.3,2.2,1.9,3.7,0.2c2.6-2.9-0.4-1.8-1.4-2.5
            c-3.5-2.5-4.4-9-1.8-12.3c4.8-6.3,9.4-9.5,16.6-11.6c1.5-0.4,3.7-0.9,4.2-2c2-4.5,7.1-6.5,8.9-10.5c1.8-4.1,4.3-3.2,7-3
            c0.7,0,1.8,1,1.9,1.6c0.6,5.5,1.4,11,1.4,16.6c0,3.1,0.4,6.2-1.9,9.5c-2.2,3.2,1.3,8.7-2.7,12.1c0.2,0.2,0.4,0.6,0.7,0.7
            c2.7,1.1,6-0.7,8.3,2.4c1,1.2,3.6,1.1,5.3,1.8c2.3,0.9,5.5,1.8,1,4.3c-2.8,1.6-0.4,2.8,0.6,3.5c0.9,0.7,2.4,0.7,3.6,1.2
            c0.8,0.3,1.4,0.8,2.1,1.3c-0.6,0.3-1.1,0.6-1.7,0.7c-0.7,0.1-1.4-0.1-2,0c-2.5,0.4-5.1,2.3-4.1,4.4c1,2,0.3,6.6,5,5.8
            c1-0.2,2.1-0.1,3,0.1c0.6,0.1,1.1,0.7,1.6,1c-0.5,0.3-1.3,1.1-1.6,0.9c-1.9-1.1-2.8,3.4-4.9,0.8c-0.2-0.2-2.1,0.5-2.8,1.2
            c-1.8,1.8,0.1,1.6,1.2,2c1.1,0.5,2.1,1.5,3.2,2.1c3.4,2,3.4,1.9-0.1,4.1c-1.1,0.7-2.1,1.6-3.1,2.5c0.5,0.5,0.9,1.4,1.5,1.5
            c1.6,0.3,2.4,0.6,1,2.2c-2.3,2.6-4.9,4.5-8.7,3.7c-1.3-0.3-2.7-0.1-4.1-0.2C982.8,337.9,982.8,338,982.8,338.2z"/>
          <Path d="M32.8,422c1.5-1.2-0.7-5.5-2.3-7.1c-3.6-3.5-5.1-2.1-6.7,1.8c-0.7,1.6-2.5,3.6-3.1-0.8c-0.4-2.6-2.7-5.1-4.4-7.3
            c-3.9-5.1-4.7-11.4-0.1-15.8c5.7-5.4,8.2-12,10.6-19.1c1-3.1,2.1-7.6,7.4-8c1.3-0.1,3.8-2.1,3-4.6c-1.2-3.6,5.2-3.8,3.3-6.9
            c-2.4-3.8,1.2-4.4,2.5-6.4c0.3-0.5,1-1.2,0.8-1.6c-1.2-4.6,2.4-8.1,2.5-12.3c0.2-5.1,0.4-10.2,0.5-15.3c0-1.2-0.9-2.3-1.2-3.5
            c-2.3-8.8,3.4-20.2,11.7-24c5.2-2.3,14.7-1.4,20,0.6c4.6,1.7,5.1,6.3,7.9,9.2c1.8,1.9,0.9,6.3,1.1,8.5c-1,4.2-0.4,7.3-2.2,10.6
            c-1.6,2.8-1.9,7.6,0.4,11.5c1,1.6,0.7,10.8,0.3,13.3c-1,5.4,1.6,11.5-2.6,16.4c2.1,3.4,2.4,6.8,0.3,10.3c4.3,3.1-0.4,5.6-1.2,7.6
            c-3.5,8.8-8.5,16.6-17.7,20.8c-5.8,2.6-5.7,2.7-4.2,8.3c0.4,1.7,0.3,5.1-0.2,5.3c-7,1.8-2.3,4.3-0.5,6.6c1.4,1.7,0.4,1.7-1.1,2.2
            c-3,0.9-5.8,2.3-8.9,3.1c-0.7,0.2-2-1.2-2.7-2.1c-0.2-0.3,0.6-1.4,0.9-2.1c0.2-0.3,0.5-0.4,0.7-0.7c1-1.5,4.9,0.2,3.9-3.2
            c-0.6-2.2-2.2-4.1-5.1-3.8c-1.3,0.1-2.7,0-4.1-0.1c-2.2-0.3-3.2,0.6-2.9,2.8c0.5,4.6-1.6,5.3,0.6,9.9c0.3,0.6-2.4,5-3.4,6.2
            c-0.8-0.8-1.5-4.1-1.8-5"/>
          <Path d="M98.6,240.8c-2.1,6.1-4.3,11.8-10.5,14.8c-4.3,2.1-8.6,3-12.6-0.5c-1.2-1.1-2.1-2.7-3.1-4c-1.2,1.2-2.3,2.9-3.8,3.3
            c-1.7,0.4-3.7-0.2-5.4-0.8c-4.9-1.6-5.4-1.5-8.2,2.3c-1.1,1.5-2.1,4.1-3.4,4.4c-3.3,0.5-6.7,0-10.1-0.4c-0.4,0-1.1-2.1-0.7-2.5
            c4.2-6,6.9-13.1,12.6-18.1c4.6-4.1,9-8.2,13.4-12.5c6.9-6.8,6.2-4.2,14.9-4.2c9.7,0,12.4,7.4,16.4,13.7
            C98.9,237.5,98.5,239.4,98.6,240.8z"/>
          <Path d="M918.9,409.5c-1.6,5.8-2.7,12.2-5.3,18c-2.2,4.8-5,9.1-4.4,14.6c0,0.3-1,1.1-1.1,1.1c-0.6-0.3-0.9-1-1.4-1.4
            c-2.1-1.9-1.6-4-0.5-6.3c2.5-5.4,4.8-10.9,7.1-16.5c0.6-1.5,1-3.1,1.1-4.7c0.3-3.7,0.2-7.5,0.5-11.2c0-0.7,0.8-1.4,1.2-2.2
            c0.7,0.7,1.8,1.4,2,2.3C918.5,405.1,918.6,407.1,918.9,409.5z"/>
        </G>
      </Svg>

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
        Keyboard.dismiss();
        if (register) {
          if (password === passwordConfirm) {
            auth(email, password, (e) => onChangeError(e), true)
          } else {
            onChangeError('"Password" and "Confirm Password" values must match, so you know you\'re entering the password your\'e intending to enter')
          }
        } else {
          auth(email, password, (e) => onChangeError(e))
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

const AuthenticationSuccessScreen = (props: {
  logout: () => void
}) => {
  const { logout } = props;
  return (
    <View style={styles.content}>
      <Title style={styles.text}>Signed in successfully 🎉</Title>
      <Button onPress={() => logout()} style={styles.button}>
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
    auth,
    logout,
    isSignout
  } : {
    navigation: StackNavigationProp<RootDrawerParamList, "Root"> | undefined,
    authenticated: boolean,
    auth: (email: string, password: string, errorCallback?: (e: any) => void, isCreation?: boolean) => void,
    logout: () => void,
    isSignout: boolean
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
          children={() => <SignInScreen auth={auth} />}
        />
      ) : (
        <SimpleStack.Screen
          name="Success"
          options={{ title: 'Authentication Success' }}
          children={() => <AuthenticationSuccessScreen logout={logout} />}
        />
      )}
    </SimpleStack.Navigator>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center'
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
    width: '95%',
    height: '16.697%',
    alignSelf: 'center',
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

interface OwnProps {
}

interface DispatchProps {
  authenticate: (email: string, password: string, errorCallback?: (e: any) => void, isCreation?: boolean) => void,
  logout: () => void,
}

const mapStateToProps = (state: State, ownProps: OwnProps): {authenticated: boolean, isSignout: boolean} => {
  return {
    authenticated: isUserAuthenticated(state.user),
    isSignout: false
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, firebase.app.App, any>, ownProps: OwnProps): DispatchProps => {
  return {
    authenticate: (email: string, password: string, errorCallback?: (e: any) => void, isCreation?: boolean) => {
      dispatch(authenticate(email, password, errorCallback, isCreation))
    },
    logout: () => {
      dispatch(signOut())
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SimpleStackScreen)