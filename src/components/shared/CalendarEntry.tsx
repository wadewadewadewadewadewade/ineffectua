import React from 'react';
import { firestore, User } from 'firebase';
import { DateObject } from 'react-native-calendars';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { State, calendarTypeEntryConverter, CalendarEntryType } from '../../Types';
import { Theme, RouteProp } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, Button, FAB, Modal, Portal } from 'react-native-paper';
import { CalendarStackParamList } from '../screens/CalendarNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

const oneDayInMilliseconds = 1000 * 60 * 60 * 24;

const NewSlot = (props : {
    date: DateObject,
    theme: Theme | undefined,
    user: firebase.User | undefined
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
  date: DateObject
}

const CalendarEntry = (props: {
  authenticated: Boolean,
  user:  User | undefined,
  theme: Theme | undefined,
  route: RouteProp<CalendarStackParamList, 'CalendarEntry'>,
  navigation: StackNavigationProp<CalendarStackParamList, 'CalendarEntry'>
  }) => {
    const [visible, setVisible] = React.useState(false);
    const { 
      authenticated,
      user,
      theme,
      route,
      navigation
    } = props;
    const { date } = route.params;
    const calendarTheme = {
      ...theme,
      arrowColor: theme && theme.dark ? 'white' : ' black',
      calendarBackground: theme && theme.dark ? 'black' : 'white'
    }
    const windowStart = new Date(Date.parse(date.dateString));
    const windowEnd = new Date(windowStart.getTime() + 1000 * 60 * 60 * 24);
    const [dates, setDates] = React.useState(new Array<CalendarEntryType>());
    if (user) {
      firestore().collection('users/' + user.uid + '/calendar')
        .where('start', '>=', windowStart).where('start', '<=', windowEnd)
        .orderBy('start')
        .withConverter(calendarTypeEntryConverter)
        .get().then((querySnapshot) => {
          setDates(querySnapshot.docs.map(d => d.data()))
        })
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
        {dates.map((d: CalendarEntryType, i: number) => <TimeSlot date={d} windowStarts={windowStart} windowEnds={windowEnd} index={i} total={dates.length}/>)}
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
    authenticated: state.AuthReducer.user !== undefined,
    user: state.AuthReducer.user,
    theme: state.ThemeReducer.theme
  };
};

export default connect(mapStateToProps)(CalendarEntry);
