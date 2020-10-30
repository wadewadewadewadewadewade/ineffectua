import React from 'react';
import {PainLogLocation} from '../../reducers/PainLogReducer';
import {useSelector} from 'react-redux';
import {State} from '../../Types';
import {
  Alert,
  Platform,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  ViewStyle,
  View,
  StyleSheet,
} from 'react-native';
import {paperColors} from '../../reducers/ThemeReducer';
import {Svg, Path} from 'react-native-svg';
import SettingsItem from '../shared/SettingsItem';
import DataTypes from '../shared/DataTypes';
import Slider from '@react-native-community/slider';
import Medications from '../shared/Medications';
import FlexableTextArea from '../shared/FlexableTextArea';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInput, Button, Divider, Text} from 'react-native-paper';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {emptyPainLogLocation} from '../../middleware/PainLogMiddleware';

type ScreenPosition = {
  x: number;
  y: number;
};

type ObjectDimensions = {
  width: number;
  height: number;
};

const percentToPixels = (
  loc: ScreenPosition,
  obj: ObjectDimensions,
): ScreenPosition => {
  return {
    x: (loc.x / 100) * obj.width,
    y: (loc.y / 100) * obj.height,
  };
};
const pixelsToPercent = (
  loc: ScreenPosition,
  obj: ObjectDimensions,
): ScreenPosition => {
  return {
    x: Math.round((loc.x / obj.width) * 10000) / 100,
    y: Math.round((loc.y / obj.height) * 10000) / 100,
  };
};
const pixelsToPercentViewStyle = (
  loc: ScreenPosition,
  obj: ObjectDimensions,
): ViewStyle => {
  const percent = pixelsToPercent(loc, obj);
  return {
    left: percent.x.toFixed(2) + '%',
    top: percent.y.toFixed(2) + '%',
  };
};
const addLocations = (
  loc1: ScreenPosition,
  loc2: ScreenPosition,
): ScreenPosition => {
  return {
    x: loc1.x + loc2.x,
    y: loc1.y + loc2.y,
  };
};
const multiplyLocation = (
  loc: ScreenPosition,
  multiplyer: number,
): ScreenPosition => ({x: loc.x * multiplyer, y: loc.y * multiplyer});
export const dimensionsEqual = (
  dim1: ObjectDimensions,
  dim2: ObjectDimensions,
) => dim1.width === dim2.width && dim1.height === dim2.height;
export const undefinedFigureDimensions: ObjectDimensions = {
  width: -1,
  height: -1,
};

type NewPainLogLocationProps = {
  value?: PainLogLocation;
  saveNewPainLogLocation: (painLogLocation?: PainLogLocation) => void;
};

export const NewPainLogLocation = ({
  value,
  saveNewPainLogLocation,
}: NewPainLogLocationProps) => {
  const theme = useSelector((state: State) => state.theme);
  const [title, setTitle] = React.useState(value?.title || '');
  const [active, setActive] = React.useState(value?.active || false);
  const [titleTouched, setTitleTouched] = React.useState(false);
  const [typeId, setTypeId] = React.useState(value?.typeId || '');
  const [medications, setMedications] = React.useState(
    value?.medications || new Array<string>(),
  );
  const [severity, setSeverity] = React.useState(value?.severity || 1);
  const [description, setDescription] = React.useState(
    value?.description || '',
  );
  const isNewLocation = !value || value === emptyPainLogLocation;
  const newPainLogLocation: PainLogLocation = {
    key: '',
    created: new Date(),
    previous: value?.key,
    title,
    active,
    typeId,
    severity,
    medications,
    description,
  };
  const buttonLabel = isNewLocation ? 'Add New' : 'Update';
  const createTwoButtonAlert = (val: boolean) =>
    Alert.alert(
      'Deactivate Pain Log Location',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          //onPress: () => console.log("Cancel Pressed"),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => setActive(val)},
      ],
      {cancelable: false},
    );
  return (
    <SafeAreaView style={{backgroundColor: theme.paper.colors.surface}}>
      <TextInput
        ref={(input) => {
          if (!titleTouched) {
            input?.focus();
          }
        }}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (!titleTouched) {
            setTitleTouched(true);
          }
        }}
        placeholder="Title"
      />
      <Divider />
      <SettingsItem
        label="Active"
        value={active}
        onValueChange={(val) => createTwoButtonAlert(val)}
      />
      <Divider />
      <DataTypes
        value={typeId}
        onValueChange={(dt) => dt.key && setTypeId(dt.key)}
      />
      <Divider />
      <View style={styles.container}>
        <Text style={{color: theme.paper.colors.text}}>Severity</Text>
        <Slider
          style={styles.slider}
          value={severity}
          minimumValue={1}
          maximumValue={10}
          onValueChange={(s: number) => setSeverity(s)}
        />
      </View>
      <Divider />
      <Medications
        value={medications}
        onValueChange={(m) => setMedications(m)}
      />
      <Divider />
      <FlexableTextArea
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <TouchableOpacity
        style={{backgroundColor: theme.paper.colors.accent, ...styles.button}}
        onPress={() => {
          saveNewPainLogLocation(newPainLogLocation);
        }}>
        <Text style={styles.buttonContents}>{buttonLabel} Location</Text>
      </TouchableOpacity>
      <Button
        onPress={() => saveNewPainLogLocation()}
        style={styles.cancelButton}>
        <Text>Cancel</Text>
      </Button>
    </SafeAreaView>
  );
};

// abbreviated view
const Location = ({
  value,
  figureDimensions,
  updateLocation,
}: {
  value: PainLogLocation;
  figureDimensions: {width: number; height: number};
  updateLocation: (loc: PainLogLocation) => void;
}) => {
  const theme = useSelector((state: State) => state.theme);
  const [locationDimensions, setLocationDimensions] = React.useState(
    undefinedFigureDimensions,
  );
  if (
    !value.position ||
    figureDimensions.width < 1 ||
    figureDimensions.height < 1
  ) {
    console.error('position or figure dimensions missing', {
      value,
      figureDimensions,
    });
    return <View />;
  }
  const scaleMax = 1.2;
  const scaleShift = {
    x: 0.5 * scaleMax * locationDimensions.width,
    y: 0.5 * scaleMax * locationDimensions.height,
  };
  let positionDelta = {x: 0, y: 0};
  //console.log({figureDimensions})
  const adjustForDesktop: ViewStyle =
    Platform.OS === 'web'
      ? {
          flexDirection: 'row',
          position: 'absolute',
          zIndex: 2,
          padding: 0,
        }
      : {};
  const animatedValue = new Animated.ValueXY(multiplyLocation(scaleShift, -1)); // center the X on the locaton
  const scale = new Animated.Value(1);
  animatedValue.addListener((val) => (positionDelta = val));
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true, //Tell iOS that we are allowing the movement
    onPanResponderGrant: (e, gestureState) => {
      scale.setValue(1.2); // make the X a bit bigger to indicate interaction
      animatedValue.extractOffset(); // move the value back into the offset
    },
    onPanResponderMove: Animated.event([
      null,
      {dx: animatedValue.x, dy: animatedValue.y},
    ]), // Creates a function to handle the movement and set offsets
    onPanResponderRelease: () => {
      scale.setValue(1);
      animatedValue.flattenOffset(); // Flatten the offset so it resets the default positioning
      if (value.position) {
        const newPosition = addLocations(
          positionDelta, // position is a delta and not an x/y offset
          percentToPixels(value.position, figureDimensions),
        );
        animatedValue.setOffset({x: 0, y: 0});
        animatedValue.setValue(multiplyLocation(scaleShift, -1));
        const newPositionPercentage = pixelsToPercent(
          newPosition,
          figureDimensions,
        );
        // this should always be true, but TypeScript likes being explicit...
        const pixels = {
          start: percentToPixels(value.position, figureDimensions),
          end: newPosition,
        };
        const percent = {start: value.position, end: newPositionPercentage};
        console.log(
          'updating',
          {pixels, percent},
          {newPosition, positionDelta},
        );
        updateLocation({
          key: value.key,
          created: new Date(),
          position: newPositionPercentage,
        }); // only update the changed information
      }
    },
  });
  let lastPress = 0;
  const onDoublePress = () => {
    const time = new Date().getTime();
    const timeDelta = time - lastPress;

    const DOUBLE_PRESS_DELAY = 400;
    if (timeDelta < DOUBLE_PRESS_DELAY) {
      updateLocation(value);
      return false;
    }
    lastPress = time;
    return true;
  };
  return (
    <Animated.View
      onStartShouldSetResponder={() => onDoublePress()}
      onLayout={(e: LayoutChangeEvent) =>
        setLocationDimensions({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
      style={[
        styles.location,
        pixelsToPercentViewStyle(
          percentToPixels(value.position, figureDimensions),
          figureDimensions,
        ),
        adjustForDesktop,
        {
          transform: [...animatedValue.getTranslateTransform(), {scale}],
        },
      ]}
      {...panResponder.panHandlers}>
      <Svg
        fill={paperColors(theme).accent}
        style={styles.locationIcon}
        x="0px"
        y="0px"
        viewBox="170 0 510.38998 544.45404">
        <Path d="m 668.17324,354.98227 c -27.09373,10.56359 -98.70397,5.0123 -144.05699,-11.16706 -52.49147,-18.72648 -56.07413,-16.82796 -53.35923,28.27137 0.83955,13.94574 -1.05874,20.38493 -6.02697,20.44135 -5.5256,0.0635 -5.67224,1.08776 -0.61708,4.29954 8.59276,5.45905 -8.08653,44.47774 -19.01295,44.47774 -5.85464,0 -5.66667,1.73323 0.90078,8.30068 4.56507,4.56483 7.01591,11.64706 5.44644,15.73693 -1.57,4.09064 -0.24441,9.05031 2.94521,11.02167 10.71075,6.61959 6.1119,14.63181 -6.16252,10.73544 -11.42079,-3.62452 -11.5294,-3.36347 -2.40226,5.76368 5.75436,5.75435 8.07673,13.06182 5.83424,18.36014 -2.04848,4.84021 -4.91657,14.29668 -6.37391,21.01533 -1.45662,6.71812 -5.85417,12.21495 -9.77195,12.21495 -10.41168,0 -25.24631,-16.54775 -22.12521,-24.68063 1.47598,-3.84651 -1.16283,-8.47029 -5.86421,-10.27412 -6.87613,-2.63906 -7.95403,-9.03666 -5.51048,-32.71198 2.04848,-19.84445 0.99575,-30.11201 -3.23119,-31.52125 -4.26777,-1.42208 -6.52891,-25.34708 -7.08499,-74.95781 -0.44899,-40.07743 -1.10156,-75.97501 -1.45054,-79.77138 -0.34873,-3.79608 -7.35208,-9.81097 -15.56308,-13.36545 -8.21124,-3.5542 -39.35934,-22.37818 -69.21807,-41.82983 -29.85905,-19.45214 -60.54804,-39.08897 -68.19791,-43.63815 -50.37445,-29.95402 -59.4031,-36.57365 -64.17656,-47.05004 -2.93261,-6.43618 -3.96465,-16.93098 -2.29336,-23.32129 3.27478,-12.52315 32.61901,-27.475962 53.91804,-27.475962 22.66972,0 112.38514,46.544862 135.35522,70.222932 30.54283,31.48444 34.88567,29.3654 35.4299,-17.29104 0.72645,-62.343742 4.90449,-107.812982 10.94511,-119.099452 8.70461,-16.26428 35.34907,-29.9812297 53.15937,-27.3673497 8.73411,1.28177 22.13758,8.86233 29.78573,16.8450597 13.72119,14.32241 13.79755,14.87269 5.7624,41.53051 -5.28572,17.53621 -8.5625,54.637162 -9.33881,105.735012 l -1.19633,78.71892 49.64023,24.42994 c 61.67453,30.35262 87.12747,41.24274 107.09662,45.82194 19.06514,4.37185 32.61777,17.03203 27.35326,25.55094 -2.33674,3.78024 -1.53774,4.8493 1.99277,2.66731 3.24128,-2.00313 7.43044,-1.1545 9.30884,1.88592 1.87911,3.04022 -3.44891,8.20423 -11.83956,11.47549 z" />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  slider: {
    flex: 1,
    maxWidth: '80%',
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
});

export default Location;
