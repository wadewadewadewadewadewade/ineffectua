import React from 'react';
import {DateObject} from 'react-native-calendars';
import {StyleSheet, ScaledSize, Dimensions, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {State} from '../../Types';
import {RouteProp} from '@react-navigation/native';
import {
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {
  TextInput,
  Text,
  Button,
  FAB,
  Modal,
  Portal,
  ActivityIndicator,
} from 'react-native-paper';
import {CalendarStackParamList} from './CalendarNavigator';
import {
  CalendarWindow,
  CalendarEntry,
  CalendarType,
} from '../../reducers/CalendarReducer';
import {
  addDate,
  datesToArray,
  getDates,
} from '../../middleware/CalendarMiddleware';
import {ThemeState} from '../../reducers/ThemeReducer';
import {AuthState} from '../../reducers/AuthReducer';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import TypesSelector from '../shared/DataTypes';
import {DataTypesType} from '../../reducers/DataTypesReducer';
import {
  defaultColor,
  contrast,
  getDatatypes,
} from '../../middleware/DataTypesMiddleware';
import ContactsSelector from '../shared/Contacts';
import Picker, {dateToString} from '../shared/ChronoPicker';
import FlexableTextArea from '../shared/FlexableTextArea';
import {
  useQuery,
  QueryStatus,
  useMutation,
  useQueryCache,
  queryCache,
} from 'react-query';

const oneDayInMilliseconds = 1000 * 60 * 60 * 24;
const screenHeightMultiplier = 1.2;

enum PickerPhases {
  Hidden,
  Starts,
  Ends,
}

const NewSlot = (props: {
  currentDay: CalendarWindow;
  saveEntry: (entry: CalendarEntry) => void;
  theme: ThemeState['theme'];
  user: AuthState['user'];
  entry: CalendarEntry;
}): JSX.Element => {
  const {user, theme, currentDay, saveEntry, entry} = props;
  const [newCalendarEntry, setNewCalendarEntry] = React.useState(entry);
  const [pickerPhase, setPickerPhase] = React.useState(PickerPhases.Hidden);
  if (!user) {
    return <View />;
  }
  const save = () => {
    return saveEntry(newCalendarEntry);
  };
  return (
    <SafeAreaView>
      <ScrollView>
        <TextInput
          value={newCalendarEntry.title}
          onChangeText={(text) =>
            setNewCalendarEntry({...newCalendarEntry, title: text})
          }
          placeholder="Add title"
        />
        <TypesSelector
          dataTypeId={entry.typeId}
          onValueChange={(datatype) =>
            setNewCalendarEntry({...newCalendarEntry, typeId: datatype.key})
          }
        />
        <View
          style={[{height: StyleSheet.hairlineWidth}, styles.fadedBackground]}
        />
        <ContactsSelector
          value={newCalendarEntry.contacts}
          onValueChange={(contacts: Array<string>) =>
            setNewCalendarEntry({...newCalendarEntry, contacts})
          }
        />
        <TouchableOpacity onPress={() => setPickerPhase(PickerPhases.Starts)}>
          <View
            style={[
              styles.buttonRow,
              styles.fadedTopBorder,
              {borderTopWidth: StyleSheet.hairlineWidth},
            ]}>
            <Text style={{color: theme.paper.colors.text}}>From</Text>
            <Text>{newCalendarEntry.window.starts.toLocaleTimeString()}</Text>
          </View>
        </TouchableOpacity>
        {pickerPhase === PickerPhases.Starts && (
          <Picker
            value={newCalendarEntry.window.starts}
            onResult={(d?: Date) => {
              if (d) {
                setNewCalendarEntry({
                  ...newCalendarEntry,
                  window: {starts: d, ends: newCalendarEntry.window.ends},
                });
              }
              setPickerPhase(PickerPhases.Hidden);
            }}
          />
        )}
        <TouchableOpacity onPress={() => setPickerPhase(PickerPhases.Ends)}>
          <View style={styles.buttonRow}>
            <Text style={{color: theme.paper.colors.text}}>Ends</Text>
            <Text>
              {dateToString(newCalendarEntry.window.ends, currentDay.ends)}
            </Text>
          </View>
        </TouchableOpacity>
        {pickerPhase === PickerPhases.Ends && (
          <Picker
            value={newCalendarEntry.window.ends}
            minimum={newCalendarEntry.window.starts}
            onResult={(d?: Date) => {
              if (d) {
                setNewCalendarEntry({
                  ...newCalendarEntry,
                  window: {starts: newCalendarEntry.window.starts, ends: d},
                });
              }
              setPickerPhase(PickerPhases.Hidden);
            }}
          />
        )}
        <FlexableTextArea
          value={newCalendarEntry.description}
          onChangeText={(text) =>
            setNewCalendarEntry({...newCalendarEntry, description: text})
          }
          placeholder="Optional Description"
        />
      </ScrollView>
      <TouchableOpacity
        onPress={save}
        style={{backgroundColor: theme.paper.colors.accent, ...styles.button}}>
        <Text style={styles.buttonContents}>Add New Calendar Event</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const TimeSlot = (props: {
  date: CalendarEntry;
  color: string;
  window: CalendarWindow;
  index: number;
  total: number;
  screenHeight: number;
  borderRadius: number;
  openModal: (entry: CalendarEntry) => void;
}): JSX.Element => {
  const {
    date,
    color,
    window,
    total,
    screenHeight,
    borderRadius,
    openModal,
  } = props;
  const {starts, ends} = date.window;
  const dateIsContainedWithinDay =
    ends.getTime() < window.starts.getTime() + oneDayInMilliseconds;
  const heightInPercentage =
    (starts.getTime() - window.starts.getTime()) / oneDayInMilliseconds;
  const marginTop = heightInPercentage * screenHeight;
  const height = !dateIsContainedWithinDay
    ? (1 - heightInPercentage) * screenHeight
    : ((ends.getTime() - starts.getTime()) / oneDayInMilliseconds) *
      screenHeight;
  const width = (1 / total) * 100 + '%';
  return (
    <View
      style={{
        width,
        marginTop,
        height,
        backgroundColor: color,
        borderRadius,
        ...styles.timeslot,
      }}>
      <TouchableWithoutFeedback
        onPress={() => openModal(date)}
        style={styles.flex}>
        <Text style={{color: contrast(color), ...styles.timeslotText}}>
          {date.title}
        </Text>
      </TouchableWithoutFeedback>
    </View>
  );
};

export type CalendarDayProps = {
  date: DateObject;
  title: string;
};

const CalendarDay = (props: {
  route: RouteProp<CalendarStackParamList, 'CalendarDay'>;
}) => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const [visible, setVisible] = React.useState(false);
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
  React.useEffect(() => {
    const onDimensionsChange = (p2: {
      window: ScaledSize;
      screen: ScaledSize;
    }) => {
      setDimensions(p2.window);
    };
    Dimensions.addEventListener('change', onDimensionsChange);
    return () => Dimensions.removeEventListener('change', onDimensionsChange);
  }, []);
  const {route} = props;
  const {date} = route.params;
  const thisDate = new Date(date.year, date.month - 1, date.day);
  const window: CalendarWindow = {
    starts: thisDate,
    ends: new Date(thisDate.getTime() - 1 + 1000 * 60 * 60 * 24),
  };
  // START dates and datatypes fetch and reconcile in multipp useQuery
  const cache = useQueryCache();
  const fetchDates = (path: string) => getDates(user);
  const fetchDatatypes = (path: string) => getDatatypes(user);
  const datesQuery = useQuery<
    CalendarType,
    Error,
    [string, number | undefined]
  >('users/calendar', fetchDates, {suspense: true});
  const dataTypesQuery = useQuery<
    DataTypesType,
    Error,
    [string, number | undefined]
  >('users/datatypes', fetchDatatypes, {suspense: true});
  const getLowestStatus = (statuses: Array<QueryStatus>) => {
    const namesToNumbers = {
      error: 0,
      loading: 1,
      success: 2,
      idle: 3,
    };
    const numbersToNames = [
      QueryStatus.Error,
      QueryStatus.Loading,
      QueryStatus.Success,
      QueryStatus.Idle,
    ];
    const statusesAsNumbers: Array<number> = statuses
      .map((s) => namesToNumbers[s])
      .sort((a, b) => a - b);
    return numbersToNames[statusesAsNumbers[0]];
  };
  const status = getLowestStatus([datesQuery.status, dataTypesQuery.status]);
  const error = datesQuery.error || dataTypesQuery.error;
  // END dates and datatypes fetch and reconcile in multipp useQuery
  const datesArray = datesQuery.data
    ? datesToArray(datesQuery.data, window.starts, window.ends)
    : [];
  const datatypes = dataTypesQuery.data;
  const [saveDate] = useMutation((d: CalendarEntry) => addDate(user, d), {
    onSuccess: (d) => {
      queryCache.setQueryData<CalendarType>('users/calendar', (old) => {
        const newDate: CalendarType = {};
        if (d.key) {
          newDate[d.key] = d;
        }
        if (old) {
          return {...old, ...newDate};
        } else {
          return newDate;
        }
      });
    },
    onSettled: () => cache.invalidateQueries('users/calendar'),
  });
  const dayGrid: Array<JSX.Element> = React.useMemo(() => {
    let grid = [];
    for (let i = 1; i < 24; i++) {
      grid.push(
        <View
          key={i}
          style={{
            backgroundColor: theme.paper.colors.disabled,
            ...styles.dayrow,
          }}>
          <Text
            style={{
              backgroundColor: theme.paper.colors.background,
              color: theme.paper.colors.disabled,
              ...styles.gridtext,
            }}>
            {i <= 12 ? i : i - 12}
            {i <= 12 ? 'am' : 'pm'}
          </Text>
        </View>,
      );
    }
    return grid;
  }, [theme.paper.colors.background, theme.paper.colors.disabled]);
  const emptyCalendarEntry: CalendarEntry = {
    title: '',
    window: {
      starts: new Date(),
      ends: new Date(),
    },
  };
  const [newCalendarEntry, setNewCalendarEntry] = React.useState(
    emptyCalendarEntry,
  );
  const openModal = (entry?: CalendarEntry) => {
    if (entry) {
      setNewCalendarEntry(entry);
    }
    setVisible(true);
  };
  const closeModal = () => {
    setNewCalendarEntry(emptyCalendarEntry);
    setVisible(false);
  };
  if (!user) {
    return <View />;
  } else if (status === QueryStatus.Loading) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching posts: {error?.message}</Text>;
  } else {
    return (
      <View style={styles.container}>
        <ScrollView
          contentOffset={{x: dimensions.height * 0.2, y: 0}}
          style={styles.relative}>
          <View
            style={{
              height: dimensions.height * screenHeightMultiplier,
              ...styles.entry,
            }}>
            <View style={styles.daygrid}>{dayGrid}</View>
          </View>
          <View style={styles.timeslots}>
            {datesArray.map((d: CalendarEntry, i: number) => (
              <TimeSlot
                key={d.key}
                date={d}
                color={
                  d.typeId && datatypes && datatypes[d.typeId]
                    ? datatypes[d.typeId].color
                    : defaultColor
                }
                window={window}
                index={i}
                total={datesArray.length}
                screenHeight={dimensions.height * screenHeightMultiplier}
                borderRadius={theme.paper.roundness}
                openModal={(entry: CalendarEntry) => openModal(entry)}
              />
            ))}
          </View>
        </ScrollView>
        {!visible && (
          <FAB
            style={styles.fab}
            small
            icon={() => <MaterialCommunityIcons name="plus" size={24} />}
            onPress={() => openModal()}
          />
        )}
        <Portal>
          <Modal visible={visible} onDismiss={() => closeModal()}>
            <View style={{backgroundColor: theme.paper.colors.surface}}>
              <NewSlot
                currentDay={window}
                entry={newCalendarEntry}
                saveEntry={(entry: CalendarEntry) => {
                  saveDate(entry).then(() => closeModal());
                }}
                theme={theme}
                user={user}
              />
              <Button onPress={() => closeModal()} style={styles.cancelButton}>
                <Text>cancel</Text>
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  relative: {
    position: 'relative',
  },
  fadedBackground: {
    backgroundColor: '#AAA',
  },
  fadedTopBorder: {
    borderTopColor: '#AAA',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  daygrid: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  dayrow: {
    height: 1,
    overflow: 'visible',
    alignItems: 'center',
    marginRight: 8,
    flexDirection: 'row',
  },
  gridtext: {
    padding: 8,
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 12,
  },
  buttons: {
    paddingHorizontal: 8,
    paddingVertical: 20,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 20,
    alignItems: 'center',
  },
  buttonContents: {
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  buttonRow: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#AAA',
  },
  entry: {
    position: 'relative',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  timeslots: {
    position: 'absolute',
    flexDirection: 'row',
    paddingLeft: 40,
  },
  timeslot: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    padding: 8,
    marginRight: 8,
  },
  timeslotText: {
    overflow: 'hidden',
  },
});

export default CalendarDay;
