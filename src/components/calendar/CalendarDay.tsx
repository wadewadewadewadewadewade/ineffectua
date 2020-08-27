import React from 'react';
import { User } from 'firebase';
import { DateObject } from 'react-native-calendars';
import { StyleSheet, Text, ScaledSize, Dimensions, View } from 'react-native';
import { connect } from 'react-redux';
import { CalendarWindow, CalendarEntry, State } from '../../Types';
import { RouteProp } from '@react-navigation/native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, Button, FAB, Modal, Portal } from 'react-native-paper';
import { CalendarStackParamList } from './CalendarNavigator';
import { Action, CalendarState } from '../../reducers/CalendarReducer';
import { addDate } from '../../middleware/CalendarMiddleware';
import { ThemeState } from '../../reducers/ThemeReducer';
import { AuthState } from '../../reducers/AuthReducer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const oneDayInMilliseconds = 1000 * 60 * 60 * 24;

const NewSlot = (props : {
    onComplete: () => void,
    date: DateObject,
    theme: ThemeState['theme'],
    user: AuthState['user']
  }): JSX.Element => {
    const { date, user, theme, onComplete } = props;
    if (!user) {
      return <View></View>
    }
    const [starts, setStart] = React.useState(new Date(Date.parse(date.dateString)));
    const [ends, setEnd] = React.useState(new Date(Date.parse(date.dateString) + 3600));
    const [title, setTitle] = React.useState('');
    const [showStart, setShowStart] = React.useState(false);
    const [showEnd, setShowEnd] = React.useState(false);
    const [description, setDescription] = React.useState('');
    const [descriptionHeight, setDescriptionHeight] = React.useState(45);
    const [contacts, setContacts] = React.useState(new Array<string>());
    const save = () => {
      const entry: CalendarEntry = {
        window: {
          starts,
          ends
        },
        title,
        description,
        contacts
      }
      return addDate(user, entry).then(onComplete)
    }
    return (
      <View>
        <ScrollView>
          <TextInput value={title} onChangeText={(text) => setTitle(text)} placeholder="Add title" />
          <TouchableOpacity onPress={() => setShowStart(true)}>
            <View  style={styles.buttonRow}>
              <Text style={{color: theme.paper.colors.text}}>From</Text>
              <Text>{starts.toLocaleTimeString()}</Text>
            </View>
          </TouchableOpacity>
          {showStart && <DateTimePicker mode="time" value={starts} onChange={(e: Event, d?: Date) => {
            if (d) {
              setStart(d)
            }
          }}/>}
          <TouchableOpacity onPress={() => setShowEnd(true)}>
            <View style={styles.buttonRow}>
              <Text style={{color: theme.paper.colors.text}}>Ends</Text>
              <Text>{ends.toLocaleTimeString()}</Text>
            </View>
          </TouchableOpacity>
          {showEnd && <DateTimePicker mode="time" value={ends} onChange={(e: Event, d?: Date) => {
            if (d) {
              setEnd(d)
            }
          }}/>}
          <TextInput
            style={styles.description}
            multiline={true}
            value={description}
            onContentSizeChange={(event) => {
              setDescriptionHeight(Math.floor(event.nativeEvent.contentSize.height / styles.description.lineHeight));
            }}
            numberOfLines={descriptionHeight}
            onChangeText={(text) => setDescription(text)} placeholder="Optional Description" />
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
  total: number
}): JSX.Element => {
  const { date, window } = props;
  const { starts, ends } = date.window;
  const dateIsContainedWithinDay = ends.getTime() < window.starts.getTime() + oneDayInMilliseconds;
  const marginTop = (starts.getTime() - window.starts.getTime()) / oneDayInMilliseconds;
  const marginBottom = dateIsContainedWithinDay ? (window.ends.getTime() - ends.getTime()) / oneDayInMilliseconds : 0;
  return (
    <View style={{marginTop, marginBottom, backgroundColor: '#600'}}>
      <Text style={{color: '#FFF'}}>{date.title}</Text>
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
    route: RouteProp<CalendarStackParamList, 'CalendarDay'>
  }) => {
    const [visible, setVisible] = React.useState(false);
    const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
    React.useEffect(() => {
      const onDimensionsChange = ({ window, screen }: { window: ScaledSize, screen: ScaledSize }) => {
        setDimensions(window);
      };
  
      Dimensions.addEventListener('change', onDimensionsChange);
  
      return () => Dimensions.removeEventListener('change', onDimensionsChange);
    }, []);
    const {
      dates,
      user,
      theme,
      route
    } = props;
    const { date } = route.params;
    const window: CalendarWindow = {
      starts: new Date(Date.parse(date.dateString)),
      ends: new Date(new Date(Date.parse(date.dateString)).getTime() + 1000 * 60 * 60 * 24)
    }
    if (!user) {
      return <View></View>
    }
    const dayGrid: Array<JSX.Element> = [];
    for(let i=1;i<24;i++) {
      dayGrid.push(
        <View key={i} style={{backgroundColor: theme.paper.colors.disabled, ...styles.dayrow}}>
          <Text style={{backgroundColor: theme.paper.colors.background, color: theme.paper.colors.disabled, ...styles.gridtext}}>{i<=12?i:i-12}{i<=12?'am':'pm'}</Text>
        </View>
      )
    }
    return (
      <View>
        <ScrollView contentOffset={{x: dimensions.height * 0.2, y: 0}}>
          <View style={{ height: dimensions.height * 1.2, ...styles.entry }}>
            <View style={styles.daygrid}>
              {dayGrid}
            </View>
          </View>
          {dates.items
            .filter((d) => d.window.starts >= window.starts && d.window.ends <= window.ends)
            .map((d: CalendarEntry, i: number) => <TimeSlot date={d} window={window} index={i} total={dates.items.length}/>)
          }
        </ScrollView>
        {!visible && <FAB
          style={styles.fab}
          small
          icon={() => <MaterialCommunityIcons name="plus" size={24} />}
          onPress={() => setVisible(true)}
        />}
        <Portal>
          <Modal visible={visible} onDismiss={() => setVisible(false)}>
            <View style={{backgroundColor: theme.paper.colors.surface}}>
              <NewSlot date={date} theme={theme} user={user} onComplete={() => setVisible(false)} />
              <Button onPress={() => setVisible(false)}><Text>cancel</Text></Button>
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
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(CalendarDay);
