import * as React from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { Appbar } from 'react-native-paper';
import {
  useTheme,
  useNavigation,
  ParamListBase,
} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerScreenProps,
  DrawerContent,
  DrawerContentComponentProps,
  DrawerContentOptions,
} from '@react-navigation/drawer';
import type { StackScreenProps } from '@react-navigation/stack';
import CalendarEntry from '../shared/CalendarEntry';
import PainLogEntry from '../shared/PainLogEntry';
import Agenda from '../shared/Agenda';

type DrawerParams = {
  CalendarEntry: undefined;
  Agenda: undefined;
  PainLogEntry: undefined;
};

const useIsLargeScreen = () => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));

  React.useEffect(() => {
    const onDimensionsChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    Dimensions.addEventListener('change', onDimensionsChange);

    return () => Dimensions.removeEventListener('change', onDimensionsChange);
  }, []);

  return dimensions.width > 414;
};

const Header = ({
  onGoBack,
  title,
}: {
  onGoBack: () => void;
  title: string;
}) => {
  const { colors } = useTheme();
  const isLargeScreen = useIsLargeScreen();

  return (
    <Appbar.Header style={{ backgroundColor: colors.card, elevation: 1 }}>
      {isLargeScreen ? null : <Appbar.BackAction onPress={onGoBack} />}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
};

const CalendarEntryScreen = ({
  navigation,
}: DrawerScreenProps<DrawerParams, 'CalendarEntry'>) => {
  return (
    <>
      <Header title="CalendarEntry" onGoBack={() => navigation.toggleDrawer()} />
      <CalendarEntry />
    </>
  );
};

const AgendaScreen = ({
  navigation,
}: DrawerScreenProps<DrawerParams, 'Agenda'>) => {
  return (
    <>
      <Header title="Agenda" onGoBack={() => navigation.toggleDrawer()} />
      <Agenda />
    </>
  );
};

const PainLogEntryScreen = ({
  navigation,
}: DrawerScreenProps<DrawerParams, 'PainLogEntry'>) => {
  return (
    <>
      <Header title="PainLogEntry" onGoBack={() => navigation.toggleDrawer()} />
      <PainLogEntry />
    </>
  );
};

const CustomDrawerContent = (
  props: DrawerContentComponentProps<DrawerContentOptions>
) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <>
      <Appbar.Header style={{ backgroundColor: colors.card, elevation: 1 }}>
        <Appbar.Action icon="close" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Pages" />
      </Appbar.Header>
      <DrawerContent {...props} />
    </>
  );
};

const Drawer = createDrawerNavigator<DrawerParams>();

type Props = Partial<React.ComponentProps<typeof Drawer.Navigator>> &
  StackScreenProps<ParamListBase>;

export default function DrawerScreen({ navigation, ...rest }: Props) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      gestureEnabled: false,
    });
  }, [navigation]);

  const isLargeScreen = useIsLargeScreen();

  return (
    <Drawer.Navigator
      openByDefault
      drawerType={isLargeScreen ? 'permanent' : 'back'}
      drawerStyle={isLargeScreen ? null : { width: '100%' }}
      overlayColor="transparent"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      {...rest}
    >
      <Drawer.Screen name="CalendarEntry" component={CalendarEntryScreen} />
      <Drawer.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ title: 'Agenda' }}
      />
      <Drawer.Screen
        name="PainLogEntry"
        component={PainLogEntryScreen}
        options={{ title: 'PainLogEntry' }}
      />
    </Drawer.Navigator>
  );
}
