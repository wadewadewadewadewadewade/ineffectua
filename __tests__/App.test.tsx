/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../src/components/App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

// neededd this to get some async items like StatusBar to build properly when running the test
jest.useFakeTimers();

jest.mock('react-native-screens', () => {
  const RealComponent = jest.requireActual('react-native-screens');
  RealComponent.enableScreens = function() {};
  return RealComponent;
});

import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

/*jest.mock('react-navigation-tabs', () => ({
  withNavigation: (Component: Function) => (props: any) => (
    <Component navigation={{ navigate: jest.fn() }} {...props} />
  ),
  createBottomTabNavigator: jest.fn()
}))

jest.mock('react-navigation-drawer', () => ({
  withNavigation: (Component: Function) => (props: any) => (
    <Component navigation={{ navigate: jest.fn() }} {...props} />
  ),
  createDrawerNavigator: jest.fn(),
}))*/

it('renders correctly', () => {
  renderer.create(<App />)
})