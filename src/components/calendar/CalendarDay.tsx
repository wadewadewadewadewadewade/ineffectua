import React from 'react';
import { DateObject } from 'react-native-calendars';
import { StyleSheet, Text, ScaledSize, Dimensions, View } from 'react-native';
import { connect } from 'react-redux';
import { CalendarWindow, CalendarEntry, State } from '../../Types';
import { RouteProp } from '@react-navigation/native';
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, Button, FAB, Modal, Portal } from 'react-native-paper';
import { CalendarStackParamList } from './CalendarNavigator';
import { CalendarState } from '../../reducers/CalendarReducer';
import { addDates, datesToArray } from '../../middleware/CalendarMiddleware';
import { ThemeState } from '../../reducers/ThemeReducer';
import { AuthState } from '../../reducers/AuthReducer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThunkDispatch } from 'redux-thunk';

const oneDayInMilliseconds = 1000 * 60 * 60 * 24;
const screenHeightMultiplier = 1.2;

const NewSlot = (props : {
    saveDate: () => void,
    date: DateObject,
    theme: ThemeState['theme'],
    user: AuthState['user'],
    passedEntry: CalendarEntry,
    setEntry: (entry: CalendarEntry) => void
  }): JSX.Element => {
    const { date, user, theme, saveDate, passedEntry, setEntry } = props;
    const [showStart, setShowStart] = React.useState(false);
    const [showEnd, setShowEnd] = React.useState(false);
    if (!user) {
      return <View></View>
    }
    const [descriptionHeight, setDescriptionHeight] = React.useState(45);
    const save = () => {
      return saveDate()
    }
    return (
      <View>
        <ScrollView>
          <TextInput value={passedEntry.title} onChangeText={(text) => setEntry({...passedEntry, title: text})} placeholder="Add title" />
          <TouchableOpacity onPress={() => setShowStart(true)}>
            <View  style={styles.buttonRow}>
              <Text style={{color: theme.paper.colors.text}}>From</Text>
              <Text>{passedEntry.window.starts.toLocaleTimeString()}</Text>
            </View>
          </TouchableOpacity>
          {showStart && <DateTimePicker mode="time" value={passedEntry.window.starts} maximumDate={passedEntry.window.ends} onChange={(e: Event, d?: Date) => {
            if (d) {
              setEntry({...passedEntry, window: { starts: d, ends: passedEntry.window.ends }})
            }
          }}/>}
          <TouchableOpacity onPress={() => setShowEnd(true)}>
            <View style={styles.buttonRow}>
              <Text style={{color: theme.paper.colors.text}}>Ends</Text>
              <Text>{passedEntry.window.ends.toLocaleTimeString()}</Text>
            </View>
          </TouchableOpacity>
          {showEnd && <DateTimePicker mode="time" value={passedEntry.window.ends} minimumDate={passedEntry.window.starts} onChange={(e: Event, d?: Date) => {
            if (d) {
              setEntry({...passedEntry, window: { starts: passedEntry.window.starts, ends: d }})
            }
          }}/>}
          <TextInput
            style={styles.description}
            multiline={true}
            value={passedEntry.description}
            onContentSizeChange={(event) => {
              setDescriptionHeight(Math.floor(event.nativeEvent.contentSize.height / styles.description.lineHeight));
            }}
            numberOfLines={descriptionHeight}
            onChangeText={(text) => setEntry({...passedEntry, description: text})} placeholder="Optional Description" />
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
  const { date, window, screenHeight, borderRadius, openModal } = props;
  const { starts, ends } = date.window;
  const dateIsContainedWithinDay = ends.getTime() < window.starts.getTime() + oneDayInMilliseconds;
  const heightInPercentage = ((starts.getTime() - window.starts.getTime()) / oneDayInMilliseconds);
  const marginTop = heightInPercentage * screenHeight;
  const height = !dateIsContainedWithinDay ? (100 - heightInPercentage) * screenHeight : (ends.getTime() - starts.getTime()) / oneDayInMilliseconds * screenHeight;
  return (
    <View style={{marginTop, height, backgroundColor: '#600', borderRadius, ...styles.timeslot}}>
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
    addDates: (entry: CalendarEntry, onComplete: () => void) => void
  }) => {
    const [visible, setVisible] = React.useState(false);
    const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
    const emptyCalendarEntry: CalendarEntry = {
      title: '',
      window: {
        starts: new Date(),
        ends: new Date()
      }
    }
    const [newCalendarEntry, setNewCalendarEntry] = React.useState(emptyCalendarEntry);
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
      addDates
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
    const dayGrid: Array<JSX.Element> = [];
    for(let i=1;i<24;i++) {
      dayGrid.push(
        <View key={i} style={{backgroundColor: theme.paper.colors.disabled, ...styles.dayrow}}>
          <Text style={{backgroundColor: theme.paper.colors.background, color: theme.paper.colors.disabled, ...styles.gridtext}}>{i<=12?i:i-12}{i<=12?'am':'pm'}</Text>
        </View>
      )
    }
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
                openModal={(slot: CalendarEntry) => openModal(slot)}/>)
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
                passedEntry={newCalendarEntry}
                setEntry={(entry: CalendarEntry) => setNewCalendarEntry(entry)}
                saveDate={() => {addDates(newCalendarEntry, () => closeModal())}}
                date={date}
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
  addDates: (entry: CalendarEntry, onComplete: () => void) => void
}

const mapStateToProps = (state: State) => {
  return {
    authenticated: state.user !== false,
    user: state.user,
    theme: state.theme,
    dates: state.dates
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    addDates: (entry: CalendarEntry, onComplete: () => void) => {
      dispatch(addDates(entry, onComplete))
    }
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(CalendarDay);
