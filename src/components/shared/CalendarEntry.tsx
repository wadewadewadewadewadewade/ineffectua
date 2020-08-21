import React from 'react';
import { firestore, User } from 'firebase';
import { DateObject } from 'react-native-calendars';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { State } from '../../Types';
import { RouteProp } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, Button, FAB, Modal, Portal } from 'react-native-paper';
import { CalendarStackParamList } from '../screens/CalendarNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { CalendarEntryType, Action, GetDatesAction, GetDates, CalendarState } from '../../reducers/CalendarReducer';
import { Theme, ThemeState } from '../../reducers/ThemeReducer';
import { AuthState } from '../../reducers/AuthReducer';

const oneDayInMilliseconds = 1000 * 60 * 60 * 24;

const NewSlot = (props : {
    date: DateObject,
    theme: ThemeState['theme'],
    user: AuthState['user']
  }): JSX.Element => {
    const { date, user } = props;
    if (!user) {
      return <View></View>
    }
    const [starts, setStart] = React.useState(new Date(Date.parse(date.dateString)));
    const [ends, setEnd] = React.useState(new Date(Date.parse(date.dateString) + 3600));
    const [title, setTitle] = React.useState('');
    const [showStart, setShowStart] = React.useState(false);
    const [showEnd, setShowEnd] = React.useState(false);
    const [description, setDescription] = React.useState(undefined);
    const [contacts, setContacts] = React.useState(new Array<string>());
    const save = () => {
      const entry: CalendarEntryType = {
        starts,
        ends,
        title,
        description,
        contacts
      }
      return firestore().collection('users/' + user.uid + '/calendar').add(entry)
    }
    return (
      <ScrollView>
        <Svg height="100%" width="100%" viewBox="0 0 100 100" style={{position:'absolute',left:0,right:0,top:0,bottom:0}}>
          <Rect
            width="154.74905"
            height="0.8018086"
            x="39.342342"
            y="27.06852" />
          <SvgText
            fontSize="7"
            fontFamily="sans-serif"
            x="15.96937"
            y="30.435143">8am</SvgText>
        </Svg>
        <View>
          <TextInput value={title} onChangeText={(text) => setTitle(text)} placeholder="Add title" />
          <Button onPress={() => setShowStart(true)} style={styles.buttonRow}>
            <Text>From</Text>
            <Text>{starts.toLocaleTimeString()}</Text>
          </Button>
          {showStart && <DateTimePicker mode="time" value={starts} onChange={(e: Event, date?: Date) => {
            if (date) {
              setStart(date)
            }
          }}/>}
          <Button onPress={() => setShowEnd(true)} style={styles.buttonRow}>
            <Text>Ends</Text>
            <Text>{ends.toLocaleTimeString()}</Text>
          </Button>
          {showEnd && <DateTimePicker mode="time" value={ends} onChange={(e: Event, date?: Date) => {
            if (date) {
              setEnd(date)
            }
          }}/>}
          <Button onPress={() => save()} style={styles.buttonRow}>
            <Text>Save</Text>
          </Button>
        </View>
      </ScrollView>
    )
}

const TimeSlot = (props : {
  date: CalendarEntryType,
  windowStarts: Date,
  windowEnds: Date,
  index: number,
  total: number
}): JSX.Element => {
  const { date, windowStarts, windowEnds } = props;
  const dateIsContainedWithinDay = date.ends.getTime() < windowStarts.getTime() + oneDayInMilliseconds;
  const marginTop = (date.starts.getTime() - windowStarts.getTime()) / oneDayInMilliseconds;
  const marginBottom = dateIsContainedWithinDay ? (windowEnds.getTime() - date.ends.getTime()) / oneDayInMilliseconds : 0;
  return (
    <View style={{marginTop, marginBottom, backgroundColor: '#600'}}>
      <Text style={{color: '#FFF'}}>{date.title}</Text>
    </View>
  )
}

export type CalendarEntryProps = {
  date: DateObject,
  title: string
}

const CalendarEntry = (props: {
    getDates: (user: AuthState['user'], callback: Function, windowStart?: Date, windowEnd?: Date) => Promise<void>,
    dates: CalendarState['dates'],
    authenticated: Boolean,
    user: AuthState['user'],
    theme: ThemeState['theme'],
    route: RouteProp<CalendarStackParamList, 'CalendarEntry'>,
    navigation: StackNavigationProp<CalendarStackParamList, 'CalendarEntry'>,
    title: string
  }) => {
    const [visible, setVisible] = React.useState(false);
    const {
      getDates,
      dates,
      authenticated,
      user,
      theme,
      route,
      navigation,
      title
    } = props;
    const { date } = route.params;
    const windowStart = new Date(Date.parse(date.dateString));
    const windowEnd = new Date(windowStart.getTime() + 1000 * 60 * 60 * 24);
    const [loaded, setLoaded] = React.useState(false);
    if (!loaded && user) {
      getDates(user, () => setLoaded(true), windowStart, windowEnd);
    }
    return (
      <ScrollView>
        <FAB
          style={styles.fab}
          small
          icon="plus"
          onPress={() => setVisible(true)}
        />
        <Portal>
          <Modal visible={visible} onDismiss={() => setVisible(false)}>
            <NewSlot date={date} theme={theme} user={user} />
          </Modal>
        </Portal>
        {dates.items.map((d: CalendarEntryType, i: number) => <TimeSlot date={d} windowStarts={windowStart} windowEnds={windowEnd} index={i} total={dates.items.length}/>)}
      </ScrollView>
    )
}

const styles = StyleSheet.create({
  buttons: {
    padding: 8,
  },
  button: {
    padding: 8,
    margin: 8
  },
  buttonRow: {
    fontSize: 12,
    justifyContent: 'space-between'
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

// Map State To Props (Redux Store Passes State To Component)
const mapStateToProps = (state: State) => {
  return {
    authenticated: state.user !== false,
    user: state.user,
    theme: state.theme,
    dates: state.dates
  };
};
const mapDispatchToProps = (dispatch: (value: Action) => void) => {
  // Action
  return {
    // Login
    getDates: (user: AuthState['user'], callback: Function, windowStart?: Date, windowEnd?: Date) => new Promise<void>((success,fail) => {
      if (user) {
        GetDates(user, windowStart, windowEnd).then(d => {
          dispatch(GetDatesAction(d));
          callback();
          success();
        })
      } else {
        fail()
      }
    })
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(CalendarEntry);
