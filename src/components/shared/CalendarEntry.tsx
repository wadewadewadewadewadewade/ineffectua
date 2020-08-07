import React from 'react';
import { firestore, User } from 'firebase';
import { DateObject } from 'react-native-calendars';
import { StyleSheet, Text, TimePickerAndroid, View } from 'react-native';
import { connect } from 'react-redux';
import { State } from '../../Types';
import { Theme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import DateTimePicker, { AndroidEvent } from '@react-native-community/datetimepicker';
import { TextInput, Button } from 'react-native-paper';

type DateTimePickerEvent = Event & {
  nativeEvent: {
    timestamp?: number,
  },
  type: 'dismissed' | 'set',
}

const TimeSlot = (props : {
    date: DateObject,
    theme: Theme | undefined
  }): JSX.Element => {
    const { date, theme } = props;
    const [start, setStart] = React.useState(new Date(Date.parse(date.dateString)));
    const [end, setEnd] = React.useState(new Date(Date.parse(date.dateString) + 3600));
    const [description, setDescription] = React.useState('');
    const [showStart, setShowStart] = React.useState(false);
    const [showEnd, setShowEnd] = React.useState(false);
    return (
      <View>
        <TextInput value={description} onChange={(ref) => console.log(ref)} placeholder="Add title" />
        <Button onPress={() => setShowStart(true)} style={styles.buttonRow}>
          <Text>From</Text>
          <Text>{start.toLocaleTimeString()}</Text>
        </Button>
        {showStart && <DateTimePicker mode="time" value={start} onChange={(e: Event, date?: Date) => {
          if (date) {
            setStart(date)
          }
        }}/>}
        <Button onPress={() => setShowEnd(true)} style={styles.buttonRow}>
          <Text>Ends</Text>
          <Text>{end.toLocaleTimeString()}</Text>
        </Button>
        {showEnd && <DateTimePicker mode="time" value={end} onChange={(e: Event, date?: Date) => {
          if (date) {
            setEnd(date)
          }
        }}/>}
        <Button onPress={() => setShowEnd(true)} style={styles.buttonRow}>
          <Text>Contacts Involved</Text>
        </Button>
      </View>
    )
}

const CalendarEntry = (props: {
  authenticated: Boolean,
  user:  User | undefined,
  theme: Theme | undefined,
  date: DateObject
  }) => {
    const { 
      authenticated,
      user,
      theme,
      date
    } = props;
    const calendarTheme = {
      ...theme,
      arrowColor: theme && theme.dark ? 'white' : ' black',
      calendarBackground: theme && theme.dark ? 'black' : 'white'
    }
    let dates: firestore.QueryDocumentSnapshot<firestore.DocumentData>[] = [];
    /*if (user) {
      firestore().collection('users/' + user.uid + '/calendar').get().then((querySnapshot) => {
        dates = querySnapshot.docs
      })
    }*/

    return (
      <ScrollView>
        <TimeSlot date={date} theme={theme} />
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
