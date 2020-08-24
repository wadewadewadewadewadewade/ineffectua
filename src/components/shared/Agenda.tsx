import React from 'react';
import { DateObject, Agenda as AgendaList } from 'react-native-calendars';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { State } from '../../Types';
import { NavigationContainerRef } from '@react-navigation/native';
import { CalendarWindow } from '../../Types';
import { Action, getDates, formatDates, CalendarState } from '../../reducers/CalendarReducer';
import { Theme, themeIsDark } from '../../reducers/ThemeReducer';
import { AuthState } from '../../reducers/AuthReducer';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

const Agenda = (props: any) => {
  const {
    getDates,
    dates,
    navigation,
    user,
    theme
  } : {
    getDates: (user: FirebaseAuthTypes.User, callback: () => void, window?: CalendarWindow) => Action,
    dates: CalendarState['dates'],
    navigation: NavigationContainerRef,
    authenticated: Boolean,
    user:  AuthState['user'],
    theme: Theme
  } = props;
  const calendarTheme = {
    ...theme.paper,
    agendaDayTextColor: themeIsDark(theme) ? '#666' : '#ccc',
    agendaDayNumColor: 'green',
    agendaTodayColor: 'red',
    agendaKnobColor: 'blue'
  }
  const [loaded, setLoaded] = React.useState(false);
  if (!loaded && user) {
    getDates(user, () => setLoaded(true));
  }

  return (
    <View>
      <AgendaList
        // The list of items that have to be displayed in agenda. If you want to render item as empty date
        // the value of date key has to be an empty array []. If there exists no value for date key it is
        // considered that the date in question is not yet loaded
        items={formatDates(dates.items)}
        // Callback that gets called when items for a certain month should be loaded (month became visible)
        loadItemsForMonth={(month) => {console.log('trigger items loading')}}
        // Callback that fires when the calendar is opened or closed
        onCalendarToggled={(calendarOpened) => {console.log(calendarOpened)}}
        // Callback that gets called on day press
        onDayPress={(day)=>{console.log('day pressed')}}
        // Callback that gets called when day changes while scrolling agenda list
        onDayChange={(day)=>{console.log('day changed')}}
        // Initially selected day
        selected={'2012-05-16'}
        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
        minDate={'2012-05-10'}
        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
        maxDate={'2012-05-30'}
        // Max amount of months allowed to scroll to the past. Default = 50
        pastScrollRange={50}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={50}
        // Specify how each item should be rendered in agenda
        renderItem={(item, firstItemInDay) => {return (<View />);}}
        // Specify how each date should be rendered. day can be undefined if the item is not first in that day.
        renderDay={(day, item) => {return (<View />);}}
        // Specify how empty date content with no items should be rendered
        renderEmptyDate={() => {return (<View />);}}
        // Specify how agenda knob should look like
        renderKnob={() => {return (<View />);}}
        // Specify what should be rendered instead of ActivityIndicator
        renderEmptyData = {() => {return (<View />);}}
        // Specify your item comparison function for increased performance
        rowHasChanged={(r1, r2) => {return r1.name !== r2.name}}
        // Hide knob button. Default = false
        hideKnob={true}
        // By default, agenda dates are marked if they have at least one item, but you can override this if needed
        /*markedDates={{
          '2012-05-16': {selected: true, marked: true},
          '2012-05-17': {marked: true},
          '2012-05-18': {disabled: true}
        }}*/
        // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
        //disabledByDefault={true}
        // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
        onRefresh={() => console.log('refreshing...')}
        // Set this true while waiting for new data from a refresh
        refreshing={false}
        // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView.
        refreshControl={null}
        // Agenda theme
        theme={calendarTheme}
        style={{
          width: '100%',
          maxWidth: '100%'
        }}
      />
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
    user: state.user,
    theme: state.theme,
    dates: state.dates
  };
};
const mapDispatchToProps = (dispatch: (value: Action) => void) => {
  // Action
  return {
    getDates: (user: FirebaseAuthTypes.User, callback: () => void, window?: CalendarWindow) => getDates(dispatch, user, callback, window)
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Agenda);
