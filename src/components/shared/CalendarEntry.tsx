import React from 'react';
import { firestore, User } from 'firebase';
import { DateObject } from 'react-native-calendars';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { State } from '../../Types';
import { Theme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';

const CalendarEntry = (props: any) => {
  const { 
    authenticated,
    user,
    theme,
    date
  } : {
    authenticated: Boolean,
    user:  User | undefined,
    theme: Theme | undefined,
    date: DateObject | undefined
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
    <View>
      <Text>{date?.dateString}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  buttons: {
    padding: 8,
  },
  button: {
    margin: 8,
  },
});

// Map State To Props (Redux Store Passes State To Component)
const mapStateToProps = (state: State) => {
  // Redux Store --> Component
  return {
    authenticated: state.AuthReducer.user !== undefined,
    user: state.AuthReducer.user,
    theme: state.ThemeReducer.theme
  };
};

export default connect(mapStateToProps)(CalendarEntry);
