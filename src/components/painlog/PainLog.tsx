import React from 'react';
import {
  StyleSheet,
  View,
  GestureResponderEvent,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Svg, Path} from 'react-native-svg';
import {PainLogLocation} from '../../reducers/PainLogReducer';
import {
  emptyPainLogLocation,
  addPainLogLocation,
  getPainLogThreads,
  PainLogThreads,
} from '../../middleware/PainLogMiddleware';
import {paperColors} from '../../reducers/ThemeReducer';
import {Modal, Portal, Text, ActivityIndicator} from 'react-native-paper';
import {
  useQueryCache,
  useQuery,
  useMutation,
  queryCache,
  QueryStatus,
} from 'react-query';
import {useSelector} from 'react-redux';
import {State} from '../../Types';
import Location, {
  NewPainLogLocation,
  undefinedFigureDimensions,
  dimensionsEqual,
} from './Location';
import {CalendarWindow} from '../../reducers/CalendarReducer';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Slider from '@react-native-community/slider';

export const PainLogComponent = ({
  painLogArray,
  onSaveLocation,
  onAddNewLocation,
}: {
  painLogArray: Array<PainLogLocation>;
  onSaveLocation: (location: PainLogLocation) => void;
  onAddNewLocation: (location: PainLogLocation) => void;
}) => {
  const theme = useSelector((state: State) => state.theme);
  const [location, setLocation] = React.useState(emptyPainLogLocation);
  const [figureDimensions, setFigureDimensions] = React.useState(
    undefinedFigureDimensions,
  );
  const adjustForDesktop = Platform.OS === 'web' ? {paddingVertical: 0} : {};
  const addLocation = (e: GestureResponderEvent) => {
    const newLocation: PainLogLocation = {
      key: '',
      created: new Date(),
      position: {
        x:
          Math.round(
            (e.nativeEvent.locationX / figureDimensions.width) * 10000,
          ) / 100,
        y:
          Math.round(
            (e.nativeEvent.locationY / figureDimensions.height) * 10000,
          ) / 100,
      },
    };
    onAddNewLocation(newLocation);
  };
  const updateLocation = (loc: PainLogLocation) => {
    const {key, next, ...rest} = loc;
    const newLocation: PainLogLocation = {key: '', ...rest, previous: key};
    onSaveLocation(newLocation);
  };
  let alternatekey = 1;
  const visibleMostRecentLocationsWithinDateRange = !dimensionsEqual(
    figureDimensions,
    undefinedFigureDimensions,
  )
    ? painLogArray
    : [];
  return (
    <>
      <Portal>
        <Modal visible={location !== emptyPainLogLocation}>
          <NewPainLogLocation
            value={location}
            saveNewPainLogLocation={(painLogLocation?: PainLogLocation) => {
              if (painLogLocation !== undefined) {
                onSaveLocation(painLogLocation);
              }
              setLocation(emptyPainLogLocation);
            }}
          />
        </Modal>
      </Portal>
      <ScrollView centerContent={true}>
        <View
          style={styles.container}
          onLayout={(e: LayoutChangeEvent) => {
            setFigureDimensions({
              width: e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
            });
          }}
          onTouchStart={(e) => addLocation(e)}>
          {visibleMostRecentLocationsWithinDateRange.map((p) => (
            <Location
              key={p.key || alternatekey++}
              value={p}
              figureDimensions={figureDimensions}
              updateLocation={(p2) => updateLocation(p2)}
            />
          ))}
          <View style={styles.touchablefigure}>
            <Svg
              style={{...styles.figure, ...adjustForDesktop}}
              fill={paperColors(theme).text}
              x="0px"
              y="0px"
              viewBox="290 0 420 1000">
              <Path d="M501.3,82.7c0,0-5,4.3-5.6,7.6l-0.1,1.3l1.6,3.8l1.6,0.5l2.5-1.6l2.5,1.6l1.6-0.5l1.7-3.8l-0.1-1.3C506.3,87,501.3,82.7,501.3,82.7z" />
              <Path d="M471.8,75.4c1.1-5.6,7.4-9.1,13.9-7.8c6.5,1.3,10.9,7,9.8,12.6c-1.1,5.7-7.4,9.2-13.9,7.8C475.1,86.7,470.7,81.1,471.8,75.4z M506.4,80c-1.1-5.7,3.3-11.3,9.8-12.7c6.5-1.3,12.8,2.2,13.9,7.8c1.1,5.6-3.3,11.3-9.8,12.6C513.8,89.1,507.5,85.6,506.4,80z" />
              <Path d="M683,495.5c-5.8-7.3-13.3-17-15.4-22.7c-3.5-9.8-6.1-41.2-6.1-41.2c-1.2-37.1-10.2-53.2-10.2-53.2c-15.7-25.2-18.6-71.9-18.6-71.9l-0.7-79c-5.5-53.9-45.3-54.3-45.3-54.3c-40.2-6-45.7-19-45.7-19c-8.5-12.2-3.6-35.7-3.6-35.7c7.1-5.8,9.8-21,9.8-21c11.7-8.9,11.2-22.2,5.8-22c-4.4,0.1-3.4-3.5-3.4-3.5C556.6,13,504.1,10,504.1,10h-8c0,0-52.6,3-45.2,62.1c0,0,1,3.6-3.4,3.5c-5.4-0.1-5.9,13,5.8,22c0,0,2.7,15.2,9.8,21c0,0,4.8,23.5-3.7,35.7c0,0-5.6,12.9-45.7,19c0,0-39.8,0.4-45.2,54.3l-0.7,79c0,0-2.9,46.8-18.6,71.9c0,0-9.1,16.1-10.2,53.2c0,0-2.6,31.4-6.2,41.2c-2.1,5.7-9.6,15.5-15.4,22.7c-11.4,14.3-30.6,44-20.4,47.3c0,0,8,0.7,18.6-20.2c0,0-0.2,8.1-8.7,31.5c-1.6,4.4-8.7,26.5,2.7,18.6c0,0,5.3-3.7,12.2-26.5c0,0-3.7,38.4,0.4,40.4c5.4,2.6,8.3-4.9,10.8-38.7c0,0,2.5-10.8,3.6,30.7c0.1,2.1,3.3,12.8,7.6,3.8c3.7-7.7,2-27.9,2-34.7c0,0,4.7,26.2,9.1,26.2c0,0,5.2,6.1,3.1-26.4c-0.4-5.3,1.4-16.3,1.7-19.5l0.5-12.6c0,0-1.3-14.3-1.3-20.3c0-1.5,5.1-21,18.6-41.5c0,0,28.1-49.8,26.3-82.4c0,0-0.4-31.1,10.9-48.6c0,0,8,88,2.6,112.7c0,0-25.3,60.6-19.7,105.9c4.1,33.7,12.1,105.7,20.1,134.1c4.2,14.6,1.7,51.8,5.1,61c1.5,4,0.7,7.7-2.6,16.9c-11.4,32-9.9,54.3,18.6,138.9c0,0,8.8,18.7,4.4,52.4c0,0-18.2,37.4-6.5,38.2c0,0,1,2.5,4.9,0.5c0,0,6.3,6.5,13.1,3c0,0,6.3,5,11.7,0.5c0,0,4.4,4.9,10.7,1c0,0,8.3,5.5,13.2-0.6c0,0,8.8,2-6.8-37.5c0,0-6-41.7-9.3-49.9c-6.2-15.7-1.8-58.2-0.5-67.4c2.2-15.3,1-41.3-2.9-61.5c-2.8-14.4,4.9-41.7,7.8-58.4c6-35.2,17.5-125.3,16.1-142.2l4.8,1.6c3.5,0,5.7-1.6,5.7-1.6c-1.4,17,10,107,16,142.2c2.8,16.7,10.6,44,7.8,58.4c-4,20.1-5.2,46.2-3,61.5c1.4,9.1,5.8,51.7-0.5,67.4c-3.3,8.2-9.2,49.9-9.2,49.9c-15.6,39.4-6.8,37.5-6.8,37.5c4.9,6.1,13.1,0.6,13.1,0.6c6.3,3.9,10.7-1,10.7-1c5.4,4.5,11.6-0.5,11.6-0.5c6.8,3.5,13.1-3,13.1-3c3.9,2,4.8-0.5,4.8-0.5c11.7-0.7-6.5-38.2-6.5-38.2c-4.4-33.6,4.4-52.4,4.4-52.4c28.5-84.6,29.9-106.9,18.6-138.9c-3.3-9.1-4-13-2.6-16.9c3.4-9.2,0.9-46.4,5-61c8-28.4,16-100.4,20.1-134.1c5.5-45.3-19.7-105.9-19.7-105.9c-5.5-24.7,2.5-112.7,2.5-112.7c11.4,17.5,10.9,48.6,10.9,48.6c-1.9,32.5,26.3,82.4,26.3,82.4c13.5,20.6,18.6,40.1,18.6,41.5c0,6-1.3,20.3-1.3,20.3l0.5,12.5c0.2,3.2,2,14.2,1.7,19.5c-2,32.5,3.1,26.4,3.1,26.4c4.4,0,9.1-26.2,9.1-26.2c0,6.8-1.6,27.1,2,34.7c4.4,9,7.5-1.6,7.6-3.8c1.2-41.5,3.6-30.6,3.6-30.6c2.4,33.7,5.4,41.3,10.8,38.7c4.1-2,0.4-40.4,0.4-40.4c6.9,22.8,12.2,26.5,12.2,26.5c11.5,7.9,4.3-14.3,2.7-18.6c-8.5-23.4-8.8-31.5-8.8-31.5c10.6,21,18.5,20.2,18.5,20.2C713.6,539.5,694.3,509.8,683,495.5z M526,98.5c-5.7,0.4-5,10.9-5,10.9c-0.9,8.2-4.5,8.2-4.5,8.2c-3.4,0.3-3.3-5-3.3-5c-0.1-5-0.9-5.6-0.9-5.6l-2.2,6.8c-0.7,5.2-4.6,4-4.6,4l-3.4-10.4l-2.3,4c-1,7.5-3.4,6.1-3.4,6.1c-4.4,0.4-3.7-6.4-3.7-6.4c0.1-5.9-2.4-3.4-2.4-3.4c-0.4,9.8-2.7,9.9-2.7,9.9c-4.5,0.8-4.9-4.4-4.9-4.4c-1.2-14.7-4.6-14.4-4.6-14.4l-11.2-1.1c-8.3-3.3-5.7-12.1-3.1-14.8c3.2-3.4,2.7-8.2,2.7-8.2c-5.3-16.3-1.8-28.1-1.8-28.1c7.1-23.1,25.5-26.2,36.8-26c12.5,0.2,18.3,3,23.3,6.3c15.7,10.1,16.2,30.4,13.4,40.7c-1.9,6.9-0.3,13.3-0.3,13.3c5.6,6.7,3.4,11.9,3.4,11.9C539.3,100.6,526,98.5,526,98.5z" />
            </Svg>
          </View>
          <View style={styles.touchablefigure}>
            <Svg
              style={{...styles.figure, ...adjustForDesktop}}
              fill={paperColors(theme).text}
              x="0px"
              y="0px"
              viewBox="290 0 420 1000">
              <Path d="m 683,495.5 c -5.8,-7.3 -13.3,-17 -15.4,-22.7 -3.5,-9.8 -6.1,-41.2 -6.1,-41.2 -1.2,-37.1 -10.2,-53.2 -10.2,-53.2 -15.7,-25.2 -18.6,-71.9 -18.6,-71.9 l -0.7,-79 c -5.5,-53.9 -45.3,-54.3 -45.3,-54.3 -40.2,-6 -45.7,-19 -45.7,-19 -8.5,-12.2 -3.6,-35.7 -3.6,-35.7 7.1,-5.8 9.8,-21 9.8,-21 11.7,-8.9 11.2,-22.2 5.8,-22 -4.4,0.1 -3.4,-3.5 -3.4,-3.5 7,-59 -45.5,-62 -45.5,-62 h -8 c 0,0 -52.6,3 -45.2,62.1 0,0 1,3.6 -3.4,3.5 -5.4,-0.1 -5.9,13 5.8,22 0,0 2.7,15.2 9.8,21 0,0 4.8,23.5 -3.7,35.7 0,0 -5.6,12.9 -45.7,19 0,0 -39.8,0.4 -45.2,54.3 l -0.7,79 c 0,0 -2.9,46.8 -18.6,71.9 0,0 -9.1,16.1 -10.2,53.2 0,0 -2.6,31.4 -6.2,41.2 -2.1,5.7 -9.6,15.5 -15.4,22.7 -11.4,14.3 -30.6,44 -20.4,47.3 0,0 8,0.7 18.6,-20.2 0,0 -0.2,8.1 -8.7,31.5 -1.6,4.4 -8.7,26.5 2.7,18.6 0,0 5.3,-3.7 12.2,-26.5 0,0 -3.7,38.4 0.4,40.4 5.4,2.6 8.3,-4.9 10.8,-38.7 0,0 2.5,-10.8 3.6,30.7 0.1,2.1 3.3,12.8 7.6,3.8 3.7,-7.7 2,-27.9 2,-34.7 0,0 4.7,26.2 9.1,26.2 0,0 5.2,6.1 3.1,-26.4 -0.4,-5.3 1.4,-16.3 1.7,-19.5 l 0.5,-12.6 c 0,0 -1.3,-14.3 -1.3,-20.3 0,-1.5 5.1,-21 18.6,-41.5 0,0 28.1,-49.8 26.3,-82.4 0,0 -0.4,-31.1 10.9,-48.6 0,0 8,88 2.6,112.7 0,0 -25.3,60.6 -19.7,105.9 4.1,33.7 12.1,105.7 20.1,134.1 4.2,14.6 1.7,51.8 5.1,61 1.5,4 0.7,7.7 -2.6,16.9 -11.4,32 -9.9,54.3 18.6,138.9 0,0 8.8,18.7 4.4,52.4 0,0 -18.2,37.4 -6.5,38.2 0,0 1,2.5 4.9,0.5 0,0 6.3,6.5 13.1,3 0,0 6.3,5 11.7,0.5 0,0 4.4,4.9 10.7,1 0,0 8.3,5.5 13.2,-0.6 0,0 8.8,2 -6.8,-37.5 0,0 -6,-41.7 -9.3,-49.9 -6.2,-15.7 -1.8,-58.2 -0.5,-67.4 2.2,-15.3 1,-41.3 -2.9,-61.5 -2.8,-14.4 4.9,-41.7 7.8,-58.4 6,-35.2 17.5,-125.3 16.1,-142.2 l 4.8,1.6 c 3.5,0 5.7,-1.6 5.7,-1.6 -1.4,17 10,107 16,142.2 2.8,16.7 10.6,44 7.8,58.4 -4,20.1 -5.2,46.2 -3,61.5 1.4,9.1 5.8,51.7 -0.5,67.4 -3.3,8.2 -9.2,49.9 -9.2,49.9 -15.6,39.4 -6.8,37.5 -6.8,37.5 4.9,6.1 13.1,0.6 13.1,0.6 6.3,3.9 10.7,-1 10.7,-1 5.4,4.5 11.6,-0.5 11.6,-0.5 6.8,3.5 13.1,-3 13.1,-3 3.9,2 4.8,-0.5 4.8,-0.5 11.7,-0.7 -6.5,-38.2 -6.5,-38.2 -4.4,-33.6 4.4,-52.4 4.4,-52.4 28.5,-84.6 29.9,-106.9 18.6,-138.9 -3.3,-9.1 -4,-13 -2.6,-16.9 3.4,-9.2 0.9,-46.4 5,-61 8,-28.4 16,-100.4 20.1,-134.1 C 607.7,496 582.5,435.4 582.5,435.4 577,410.7 585,322.7 585,322.7 c 11.4,17.5 10.9,48.6 10.9,48.6 -1.9,32.5 26.3,82.4 26.3,82.4 13.5,20.6 18.6,40.1 18.6,41.5 0,6 -1.3,20.3 -1.3,20.3 L 640,528 c 0.2,3.2 2,14.2 1.7,19.5 -2,32.5 3.1,26.4 3.1,26.4 4.4,0 9.1,-26.2 9.1,-26.2 0,6.8 -1.6,27.1 2,34.7 4.4,9 7.5,-1.6 7.6,-3.8 1.2,-41.5 3.6,-30.6 3.6,-30.6 2.4,33.7 5.4,41.3 10.8,38.7 4.1,-2 0.4,-40.4 0.4,-40.4 6.9,22.8 12.2,26.5 12.2,26.5 11.5,7.9 4.3,-14.3 2.7,-18.6 -8.5,-23.4 -8.8,-31.5 -8.8,-31.5 10.6,21 18.5,20.2 18.5,20.2 10.7,-3.4 -8.6,-33.1 -19.9,-47.4 z" />
            </Svg>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

let recentInMilliseconds = new Date().getTime();
let oldestInMilliseconds = 0;
const spreadInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours

export const PainLogData = () => {
  const user = useSelector((state: State) => state.user);
  const cache = useQueryCache();
  const [dateRange, setDateRange] = React.useState(1);
  const fetchPainLog = (path: string) => getPainLogThreads(user);
  const {data, status, error} = useQuery<
    PainLogThreads,
    Error,
    [string, number | undefined]
  >('users/painlog', fetchPainLog, {suspense: true});
  const [saveLocation] = useMutation(
    (l: PainLogLocation) => addPainLogLocation(user, l),
    {
      onSuccess: (m) => {
        queryCache.setQueryData<PainLogThreads>('users/painlog', (old) => {
          if (old !== undefined) {
            // there should always be a Threds object
            return old.push(m);
          } else {
            return new PainLogThreads({[m.key]: m});
          }
        });
      },
      onSettled: () => cache.invalidateQueries('users/painlog'),
    },
  );
  if (data !== undefined) {
    recentInMilliseconds = data.newest.date.getTime();
    oldestInMilliseconds = data.oldest.date.getTime();
  }
  const window: CalendarWindow = {
    starts: new Date(
      (recentInMilliseconds - oldestInMilliseconds) * dateRange +
        oldestInMilliseconds -
        spreadInMilliseconds,
    ),
    ends: new Date(
      (recentInMilliseconds - oldestInMilliseconds) * dateRange +
        oldestInMilliseconds +
        spreadInMilliseconds,
    ),
  };
  const painLogArray = data ? data.getArray(window.starts, window.ends) : [];
  if (!user) {
    return <View />;
  } else if (status === QueryStatus.Loading) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching posts: {error?.message}</Text>;
  } else {
    return (
      <>
        <Slider
          style={styles.slider}
          value={dateRange}
          minimumValue={0}
          maximumValue={1}
          onValueChange={(s: number) => setDateRange(s)}
        />
        <PainLogComponent
          painLogArray={painLogArray}
          onSaveLocation={(loc) => saveLocation(loc)}
          onAddNewLocation={(loc) => saveLocation(loc)}
        />
      </>
    );
  }
};

export const PainLog = () => {
  const navigation = useNavigation();
  useFocusEffect(() => {
    navigation.dangerouslyGetParent()?.setOptions({headerTitle: 'Pain Log'});
  });
  return (
    <View style={styles.outerContainer}>
      <React.Suspense fallback={<ActivityIndicator />}>
        <PainLogData />
      </React.Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    height: '100%',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  button: {
    padding: 16,
    alignItems: 'center',
    paddingVertical: 16,
  },
  buttonRow: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#AAA',
  },
  buttonContents: {
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 'auto',
    flex: 1,
    overflow: 'hidden',
  },
  touchablefigure: {
    flex: 1,
    margin: 'auto',
  },
  figure: {
    paddingVertical: '120%',
  },
  location: {
    position: 'absolute',
    zIndex: 2,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10, //for the center of the X
  },
  locationIcon: {
    width: 40,
    height: 40,
  },
  locationText: {
    width: 100,
    fontSize: 24,
  },
  locationDeleteIcon: {
    fontSize: 30,
    paddingHorizontal: 2,
  },
  slider: {
    flex: 1,
    maxWidth: '80%',
    minWidth: '80%',
    marginHorizontal: 'auto',
    marginVertical: 12,
  },
});

export default PainLog;
