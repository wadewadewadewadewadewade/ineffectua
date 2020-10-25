import React from 'react';
import {Agenda as AgendaList, DateObject} from 'react-native-calendars';
import {StyleSheet, View, Text} from 'react-native';
import {useSelector} from 'react-redux';
import {State} from '../../Types';
import {CalendarType, CalendarWindow} from '../../reducers/CalendarReducer';
import {
  formatDates,
  formatDatesForMarking,
  dateInDateWindow,
  addDays,
  getDates,
} from '../../middleware/CalendarMiddleware';
import {themeIsDark} from '../../reducers/ThemeReducer';
import Posts from '../shared/Posts';
import {DataTypesType} from '../../reducers/DataTypesReducer';
import {firebaseDocumentToArray} from '../../firebase/utilities';
import {useQuery} from 'react-query';
import {getDatatypes} from '../../middleware/DataTypesMiddleware';
import {navigate} from '../RootNavigation';
import {PostsStackParams} from '../MaterialBottomTabs';
import {StackNavigationProp} from '@react-navigation/stack';

const Agenda = ({
  navigation,
}: {
  navigation: StackNavigationProp<PostsStackParams, 'Posts'>;
}) => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const calendarTheme = {
    ...theme.paper,
    agendaDayTextColor: themeIsDark(theme) ? '#666' : '#ccc',
    agendaDayNumColor: 'green',
    agendaTodayColor: 'red',
    agendaKnobColor: 'blue',
  };
  const fetchDates = (path: string) => getDates(user);
  const fetchDatatypes = (path: string) => getDatatypes(user);
  const datesQuery = useQuery<
    CalendarType,
    Error,
    [string, number | undefined]
  >('user/calendar', fetchDates, {suspense: false});
  const dataTypesQuery = useQuery<
    DataTypesType,
    Error,
    [string, number | undefined]
  >('user/datatypes', fetchDatatypes, {suspense: false});
  const dates: CalendarType = datesQuery.data || {};
  const datatypes = dataTypesQuery.data || {};
  const datesArray = firebaseDocumentToArray(dates);
  const upcomingWeek: CalendarWindow = {
    starts: new Date(),
    ends: addDays(new Date(), 7),
  };
  const datesThisWeek = datesArray.filter((d) =>
    dateInDateWindow(d, upcomingWeek),
  );
  return (
    <View style={styles.container}>
      {datesThisWeek.length > 0 && (
        <AgendaList
          style={styles.agenda}
          // The list of items that have to be displayed in agenda. If you want to render item as empty date
          // the value of date key has to be an empty array []. If there exists no value for date key it is
          // considered that the date in question is not yet loaded
          items={formatDates(dates)}
          // Callback that gets called when items for a certain month should be loaded (month became visible)
          //loadItemsForMonth={(month) => {console.log('trigger items loading')}}
          // Callback that fires when the calendar is opened or closed
          //onCalendarToggled={(calendarOpened) => {console.log(calendarOpened)}}
          // Callback that gets called on day press
          onDayPress={(day: DateObject) =>
            navigate(
              'CalendarDay',
              {date: day},
              'Calendar: ' +
                new Date(Date.parse(day.dateString)).toDateString(),
            )
          }
          // Callback that gets called when day changes while scrolling agenda list
          //onDayChange={(day)=>{console.log('day changed')}}
          // Initially selected day
          selected={new Date()}
          // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
          //minDate={'2012-05-10'}
          // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
          //maxDate={'2012-05-30'}
          // Max amount of months allowed to scroll to the past. Default = 50
          pastScrollRange={50}
          // Max amount of months allowed to scroll to the future. Default = 50
          futureScrollRange={50}
          // Specify how each item should be rendered in agenda
          renderItem={(item, firstItemInDay: boolean) => {
            return (
              <View>
                <Text>{item.name}</Text>
              </View>
            );
          }}
          // Specify how each date should be rendered. day can be undefined if the item is not first in that day.
          renderDay={(day, item) => {
            return <View />;
          }}
          // Specify how empty date content with no items should be rendered
          renderEmptyDate={() => {
            return <View />;
          }}
          // Specify how agenda knob should look like
          renderKnob={() => {
            return <View />;
          }}
          // Specify what should be rendered instead of ActivityIndicator
          renderEmptyData={() => {
            return <View />;
          }}
          // Specify your item comparison function for increased performance
          rowHasChanged={(r1, r2) => {
            return r1.name !== r2.name;
          }}
          // Hide knob button. Default = false
          hideKnob={true}
          // By default, agenda dates are marked if they have at least one item, but you can override this if needed
          markedDates={formatDatesForMarking(dates, datatypes)}
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
        />
      )}
      <Posts navigation={navigation} showComposePost={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flex: 1,
    position: 'relative',
  },
  agenda: {
    flex: 1,
  },
});

export default Agenda;
