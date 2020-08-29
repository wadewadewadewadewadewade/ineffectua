import React from 'react';
import { CalendarList, DateObject } from 'react-native-calendars';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { State } from '../../Types';
import { CalendarState } from '../../reducers/CalendarReducer';
import { formatDatesForMarking } from '../../middleware/CalendarMiddleware';
import { themeIsDark, ThemeState } from '../../reducers/ThemeReducer';
import { CalendarStackParamList } from './CalendarNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

let temp = 0;

const Calendar = (props: {
  dates: CalendarState['dates'],
  theme: ThemeState['theme'],
  navigation: StackNavigationProp<CalendarStackParamList, 'Calendar'>
}) => {
  const {
    dates,
    navigation,
    theme
  } = props;
  const calendarTheme = {
    ...theme.paper,
    arrowColor: themeIsDark(theme) ? '#666' : '#ccc',
    calendarBackground: themeIsDark(theme) ? '#000' : '#fff'
  }
  /*const current = new Date(),
    month = current.getMonth() + 1,
    year = current.getFullYear(),
    lastDay = new Date(year, month + 1, 0).getDate()*/;

  return (
    <View>
      <CalendarList
        // Initially visible month. Default = Date()
        //current={year + '-' + (month < 10 ? '0' + month : month) + '-01'}
        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
        //minDate={'2012-05-10'}
        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
        //maxDate={'2012-05-30'}
        markedDates={formatDatesForMarking(dates)}
        markingType='multi-dot'
        //displayLoadingIndicator={true}
        // Handler which gets executed on day press. Default = undefined
        onDayPress={(day: DateObject) => navigation.navigate('CalendarDay', { date: day, title: 'Calendar: ' + new Date(Date.parse(day.dateString)).toDateString() })}
        // Handler which gets executed on day long press. Default = undefined
        //onDayLongPress={(day: DateObject) => navigation.navigate('ModalScreen', { component: CalendarEntry, date: day })}
        // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
        monthFormat={'yyyy MM'}
        // Handler which gets executed when visible month changes in calendar. Default = undefined
        onMonthChange={(mo: DateObject) => {console.log('month changed', mo)}}
        // Hide month navigation arrows. Default = false
        //hideArrows={true}
        // Replace default arrows with custom ones (direction can be 'left' or 'right')
        //renderArrow={(direction: string) => (<Arrow/>)}
        // Do not show days of other months in month page. Default = false
        //ideExtraDays={true}
        // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
        // day from another month that is visible in calendar page. Default = false
        //disableMonthChange={true}
        // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
        //firstDay={1}
        // Hide day names. Default = false
        //hideDayNames={true}
        // Show week numbers to the left. Default = false
        //showWeekNumbers={true}
        // Handler which gets executed when press arrow icon left. It receive a callback can go back month
        //onPressArrowLeft={subtractMonth => subtractMonth()}
        // Handler which gets executed when press arrow icon right. It receive a callback can go next month
        //onPressArrowRight={addMonth => addMonth()}
        // Disable left arrow. Default = false
        //disableArrowLeft={true}
        // Disable right arrow. Default = false
        //disableArrowRight={true}
        // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
        //disableAllTouchEventsForDisabledDays={true}
        /** Replace default month and year title with custom one. the function receive a date as parameter. */
        //renderHeader={(date: Date) => {/*Return JSX*/}}
        theme={calendarTheme}
        // Callback which gets executed when visible months change in scroll view. Default = undefined
        onVisibleMonthsChange={(months) => {console.log('now these months are visible', months);}}
        // Max amount of months allowed to scroll to the past. Default = 50
        pastScrollRange={50}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={50}
        // Enable or disable scrolling of calendar list
        scrollEnabled={true}
        // Enable or disable vertical scroll indicator. Default = false
        showScrollIndicator={true}
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

const mapStateToProps = (state: State) => {
  return {
    user: state.user,
    theme: state.theme,
    dates: state.dates
  };
};
export default connect(mapStateToProps)(Calendar);
