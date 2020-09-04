import React from 'react';
import { DateObject } from 'react-native-calendars';
import { StyleSheet, ScaledSize, Dimensions, View } from 'react-native';
import { connect } from 'react-redux';
import { CalendarWindow, CalendarEntry, State } from '../../Types';
import { RouteProp } from '@react-navigation/native';
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, Text, Button, FAB, Modal, Portal } from 'react-native-paper';
import { CalendarStackParamList } from './CalendarNavigator';
import { CalendarState } from '../../reducers/CalendarReducer';
import { addDates, datesToArray, formatTime, formatDateAndTime } from '../../middleware/CalendarMiddleware';
import { ThemeState } from '../../reducers/ThemeReducer';
import { AuthState } from '../../reducers/AuthReducer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThunkDispatch } from 'redux-thunk';
import TypesSelector from '../shared/DataTypes';

const oneDayInMilliseconds = 1000 * 60 * 60 * 24;
const screenHeightMultiplier = 1.2;

const Picker = (props : { value: Date, onResult: (d?: Date) => void, minimum?: Date }) => {
  const { value, minimum, onResult } = props;
  const [phase, setPhase] = React.useState('date' as "time" | "date" | "datetime" | "countdown" | undefined);
  const [datetime, setDateTime] = React.useState(value);
  return (
    <DateTimePicker mode={phase} value={datetime} minimumDate={minimum} onChange={(e: Event, d?: Date) => {
      if (d) {
        setDateTime(d);
        if (phase === 'date') {
          setPhase('time')
        } else {
          onResult(d)
        }
      } else {
        onResult()
      }
    }}/>)
}

enum PickerPhases {
  Hidden,
  Starts,
  Ends
}

const NewSlot = (props : {
    currentDay: CalendarWindow,
    saveEntry: (entry: CalendarEntry) => void,
    theme: ThemeState['theme'],
    user: AuthState['user'],
    entry: CalendarEntry
  }): JSX.Element => {
    const { user, theme, currentDay, saveEntry, entry } = props;
    const [newCalendarEntry, setNewCalendarEntry] = React.useState(entry);
    const [pickerPhase, setPickerPhase] = React.useState(PickerPhases.Hidden);
    if (!user) {
      return <View></View>
    }
    const [descriptionHeight, setDescriptionHeight] = React.useState(1);
    const save = () => {
      return saveEntry(newCalendarEntry)
    }
    return (
      <View>
        <ScrollView>
          <TextInput value={newCalendarEntry.title} onChangeText={(text) => setNewCalendarEntry({...newCalendarEntry, title: text})} placeholder="Add title" />
          <TypesSelector onValueChange={(datatype) => setNewCalendarEntry({...newCalendarEntry, typeId: datatype.key})} />
          <TouchableOpacity onPress={() => setPickerPhase(PickerPhases.Starts)}>
            <View style={styles.buttonRow}>
              <Text style={{color: theme.paper.colors.text}}>From</Text>
              <Text>{newCalendarEntry.window.starts.toLocaleTimeString()}</Text>
            </View>
          </TouchableOpacity>
          {pickerPhase === PickerPhases.Starts && <Picker
            value={newCalendarEntry.window.starts}
            onResult={(d?: Date) => {
              if (d) {
                setNewCalendarEntry({...newCalendarEntry, window: { starts: d, ends: newCalendarEntry.window.ends }})
              }
              setPickerPhase(PickerPhases.Hidden)
          }}/>}
          <TouchableOpacity onPress={() => setPickerPhase(PickerPhases.Ends)}>
            <View style={styles.buttonRow}>
              <Text style={{color: theme.paper.colors.text}}>Ends</Text>
              <Text>{newCalendarEntry.window.ends <= currentDay.ends ? formatTime(newCalendarEntry.window.ends) : formatDateAndTime(newCalendarEntry.window.ends)}</Text>
            </View>
          </TouchableOpacity>
          {pickerPhase === PickerPhases.Ends && <Picker
            value={newCalendarEntry.window.ends}
            minimum={newCalendarEntry.window.starts}
            onResult={(d?: Date) => {
              if (d) {
                setNewCalendarEntry({...newCalendarEntry, window: { starts: newCalendarEntry.window.starts, ends: d }})
              }
              setPickerPhase(PickerPhases.Hidden)
          }}/>}
          <TextInput
            style={styles.description}
            multiline={true}
            value={newCalendarEntry.description}
            onContentSizeChange={(event) => {
              setDescriptionHeight(Math.floor(event.nativeEvent.contentSize.height / styles.description.lineHeight));
            }}
            numberOfLines={descriptionHeight}
            onChangeText={(text) => setNewCalendarEntry({...newCalendarEntry, description: text})} placeholder="Optional Description" />
        </ScrollView>
        <TouchableOpacity onPress={save} style={{backgroundColor: theme.paper.colors.accent, ...styles.button}}>
          <Text style={styles.buttonContents}>Save</Text>
        </TouchableOpacity>
      </View>
    )
}

const TimeSlot = (props : {
  date: CalendarEntry,
  window: CalendarWindow,
  index: number,
  total: number,
  screenHeight: number,
  borderRadius: number,
  openModal: (entry: CalendarEntry) => void
}): JSX.Element => {
  const { date, window, total, screenHeight, borderRadius, openModal } = props;
  const { starts, ends } = date.window;
  const dateIsContainedWithinDay = ends.getTime() < window.starts.getTime() + oneDayInMilliseconds;
  const heightInPercentage = ((starts.getTime() - window.starts.getTime()) / oneDayInMilliseconds);
  const marginTop = heightInPercentage * screenHeight;
  const height = !dateIsContainedWithinDay ? (100 - heightInPercentage) * screenHeight : (ends.getTime() - starts.getTime()) / oneDayInMilliseconds * screenHeight;
  const width = 1 / total * 100 + '%'
  return (
    <View style={{width, marginTop, height, backgroundColor: '#600', borderRadius, ...styles.timeslot}}>
      <TouchableWithoutFeedback onPress={() => openModal(date)} style={{width:'100%',height:'100%'}}>
        <Text style={{color: '#FFF', ...styles.timeslotText}}>{date.title}</Text>
      </TouchableWithoutFeedback>
    </View>
  )
}

export type CalendarDayProps = {
  date: DateObject,
  title: string
}

const CalendarDay = (props: {
    dates: CalendarState['dates'],
    user: AuthState['user'],
    theme: ThemeState['theme'],
    route: RouteProp<CalendarStackParamList, 'CalendarDay'>,
    saveDates: (entry: CalendarEntry, onComplete: () => void) => void
  }) => {
    const [visible, setVisible] = React.useState(false);
    const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
    React.useEffect(() => {
      const onDimensionsChange = (p2: { window: ScaledSize, screen: ScaledSize }) => {
        setDimensions(p2.window);
      };
      Dimensions.addEventListener('change', onDimensionsChange);
      return () => Dimensions.removeEventListener('change', onDimensionsChange);
    }, []);
    const {
      dates,
      user,
      theme,
      route,
      saveDates
    } = props;
    const { date } = route.params;
    const thisDate = new Date(date.year, date.month - 1, date.day);
    const window: CalendarWindow = {
      starts: thisDate,
      ends: new Date((thisDate.getTime() - 1) + 1000 * 60 * 60 * 24)
    }
    if (!user) {
      return <View></View>
    }
    const datesArray = datesToArray(dates, window.starts, window.ends);
    const dayGrid: Array<JSX.Element> = React.useMemo(() => {
      let grid = []
      for(let i=1;i<24;i++) {
        grid.push(
          <View key={i} style={{backgroundColor: theme.paper.colors.disabled, ...styles.dayrow}}>
            <Text style={{backgroundColor: theme.paper.colors.background, color: theme.paper.colors.disabled, ...styles.gridtext}}>{i<=12?i:i-12}{i<=12?'am':'pm'}</Text>
          </View>
        )
      }
      return grid;
    }, [])
    const emptyCalendarEntry: CalendarEntry = {
      title: '',
      window: {
        starts: new Date(),
        ends: new Date()
      }
    }
    const [newCalendarEntry, setNewCalendarEntry] = React.useState(emptyCalendarEntry);
    const openModal = (entry?: CalendarEntry) => {
      if (entry) {
        setNewCalendarEntry(entry)
      }
      setVisible(true)
    }
    const closeModal = () => {
      setNewCalendarEntry(emptyCalendarEntry);
      setVisible(false);
    }
    return (
      <View>
        <ScrollView contentOffset={{x: dimensions.height * 0.2, y: 0}} style={{position: 'relative'}}>
          <View style={{ height: dimensions.height * screenHeightMultiplier, ...styles.entry }}>
            <View style={styles.daygrid}>
              {dayGrid}
            </View>
          </View>
          <View style={styles.timeslots}>
            {datesArray
              .map((d: CalendarEntry, i: number) => <TimeSlot
                key={d.key}
                date={d}
                window={window}
                index={i}
                total={datesArray.length}
                screenHeight={dimensions.height * screenHeightMultiplier}
                borderRadius={theme.paper.roundness}
                openModal={(entry: CalendarEntry) => openModal(entry)}/>)
            }
          </View>
        </ScrollView>
        {!visible && <FAB
          style={styles.fab}
          small
          icon={() => <MaterialCommunityIcons name="plus" size={24} />}
          onPress={() => openModal()}
        />}
        <Portal>
          <Modal visible={visible} onDismiss={() => closeModal()}>
            <View style={{backgroundColor: theme.paper.colors.surface}}>
              <NewSlot
                currentDay={window}
                entry={newCalendarEntry}
                saveEntry={(entry: CalendarEntry) => {saveDates(entry, () => closeModal())}}
                theme={theme}
                user={user} />
              <Button onPress={() => closeModal()}><Text>cancel</Text></Button>
            </View>
          </Modal>
        </Portal>
      </View>
    )
}

const styles = StyleSheet.create({
  description: {
    fontSize: 16,
    lineHeight: 22
  },
  daygrid: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'space-evenly'
  },
  dayrow: {
    height: 1,
    overflow: 'visible',
    alignItems: 'center',
    marginRight: 8,
    flexDirection: 'row'
  },
  gridtext: {
    padding: 8,
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 12
  },
  buttons: {
    padding: 8,
  },
  button: {
    padding: 8,
    alignItems: 'center',
  },
  buttonContents : {
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  buttonRow: {
    fontSize: 12,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#AAA',
  },
  entry: {
    position:'relative'
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
    padding:8,
    marginRight:8
  },
  timeslotText: {
    overflow: 'hidden',
  }
});

interface OwnProps {
}

interface DispatchProps {
  saveDates: (entry: CalendarEntry, onComplete: () => void) => void
}

const mapStateToProps = (state: State) => {
  return {
    authenticated: state.user !== false,
    user: state.user,
    theme: state.theme,
    dates: state.dates,
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    saveDates: (entry: CalendarEntry, onComplete: () => void) => {
      dispatch(addDates(entry, onComplete))
    }
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(CalendarDay);
