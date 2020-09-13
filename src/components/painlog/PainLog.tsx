import React from 'react';
import { StyleSheet, View, GestureResponderEvent, Alert } from 'react-native'
import { Svg, Path, SvgProps, } from 'react-native-svg'
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { State } from '../../Types';
import { PainLogLocation, PainLogType } from '../../reducers/PainLogReducer';
import { addPainLogLocation, emptyPainLogLocation } from '../../middleware/PainLogMiddleware';
import { ScrollView, TouchableOpacity, TouchableHighlight } from 'react-native-gesture-handler';
import ReactDOM from 'react-dom';
import { firebaseDocumentToArray } from '../../middleware';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { paperColors, ThemeState } from '../../reducers/ThemeReducer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, Portal, TextInput, Button, Text } from 'react-native-paper';
import SettingsItem from '../shared/SettingsItem';
import DataTypes from '../shared/DataTypes';
import Slider from '@react-native-community/slider';
import Medications from '../shared/Medications';

type NewPainLogLocationProps = {
  value?: PainLogLocation
  painlog: PainLogType,
  theme: ThemeState['theme'],
  saveNewPainLogLocation: (painLogLocation?: PainLogLocation, previousPainLogId?: string) => void
}

export const NewPainLogLocation = ({
  value,
  painlog,
  theme,
  saveNewPainLogLocation
}: NewPainLogLocationProps) => {
  const [title, setTitle] = React.useState(value?.title || '');
  const [active, setActive] = React.useState(value?.active || false);
  const [titleTouched, setTitleTouched] = React.useState(false);
  const [typeId, setTypeId] = React.useState(value?.typeId || '');
  const [medications, setMedications] = React.useState(value?.medications || new Array<string>());
  const [severity, setSeverity] = React.useState(value?.severity || 1);
  const [description, setDescription] = React.useState(value?.description || '');
  const newPainLogLocation: PainLogLocation = {
    created: new Date(Date.now()),
    title,
    active,
    typeId,
    severity,
    medications,
    description
  };
  const buttonLabel = !value || value === emptyPainLogLocation ? 'Add New' : 'Edit';
  const [descriptionHeight, setDescriptionHeight] = React.useState(1);
  const position = value && value.position ? {left: value?.position.x + '%', top: value?.position.y + '%'} : {};
  return (
    <SafeAreaView style={{backgroundColor: theme.paper.colors.surface, ...position}}>
      <TextInput
        ref={(input) => {
          if (!titleTouched) {
            input?.focus();
          }
        }}
        value={title}
        onChangeText={(text) => {
          setTitle(text)
          if (!titleTouched) {
            setTitleTouched(true)
          }
        }}
        placeholder="Title" />
      <SettingsItem label="Active" value={active} onValueChange={(val) => setActive(val)} />
      <DataTypes
        value={typeId}
        onValueChange={(dt) => dt.key && setTypeId(dt.key)}
        />
      <Slider
        value={severity}
        minimumValue={1}
        maximumValue={10}
        onValueChange={(s: number) => setSeverity(s)}
        />
      <Medications
        value={medications}
        onValueChange={(m) => setMedications(m)}
        />
      <TextInput
        style={styles.description}
        multiline={true}
        value={description}
        onContentSizeChange={(event) => {
          setDescriptionHeight(Math.floor(event.nativeEvent.contentSize.height / styles.description.lineHeight));
        }}
        numberOfLines={descriptionHeight}
        onChangeText={(text) => setDescription(text)}
        placeholder="Optional Description" />
      <TouchableOpacity
        style={{backgroundColor: theme.paper.colors.accent, ...styles.button}}
        onPress={() => {
          addPainLogLocation(newPainLogLocation, value?.key)
        }}>
        <Text style={styles.buttonContents}>{buttonLabel} Medication</Text>
      </TouchableOpacity>
      <Button onPress={() => saveNewPainLogLocation()} style={{paddingVertical:8}}><Text>Cancel</Text></Button>
    </SafeAreaView>
  )
}

// abbreviated view
const Location = ({
  location,
  theme,
  onPress
}: {
  location: PainLogLocation,
  theme: ThemeState['theme'],
  onPress: () => void
}) => {
  const offset = location.position ? { left: location.position.x + '%', top: location.position.y + '%' } : {}
  const createTwoButtonAlert = (loc: PainLogLocation) =>
    Alert.alert(
      "Deactivate Pain Log Location",
      "Are you sure?",
      [
        {
          text: "Cancel",
          //onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => addPainLogLocation({created: new Date(), active: false}, location.key) }
      ],
      { cancelable: false }
    );
  return (
    <View style={{...styles.location, ...offset}}>
      <TouchableHighlight onPress={onPress}>
        <Svg x="0px" y="0px" viewBox="170 0 650 1000" enable-background="new 170 0 650 1000">
          <Path d="M 614.77414,560.12174 C 587.68041,570.68533 516.07017,565.13404 470.71715,548.95468 C 418.22568,530.22820 414.64302,532.12672 417.35792,577.22605 C 418.19747,591.17179 416.29918,597.61098 411.33095,597.66740 C 405.80535,597.73092 405.65871,598.75516 410.71387,601.96694 C 419.30663,607.42599 402.62734,646.44468 391.70092,646.44468 C 385.84628,646.44468 386.03425,648.17791 392.60170,654.74536 C 397.16677,659.31019 399.61761,666.39242 398.04814,670.48229 C 396.47814,674.57293 397.80373,679.53260 400.99335,681.50396 C 411.70410,688.12355 407.10525,696.13577 394.83083,692.23940 C 383.41004,688.61488 383.30143,688.87593 392.42857,698.00308 C 398.18293,703.75743 400.50530,711.06490 398.26281,716.36322 C 396.21433,721.20343 393.34624,730.65990 391.88890,737.37855 C 390.43228,744.09667 386.03473,749.59350 382.11695,749.59350 C 371.70527,749.59350 356.87064,733.04575 359.99174,724.91287 C 361.46772,721.06636 358.82891,716.44258 354.12753,714.63875 C 347.25140,711.99969 346.17350,705.60209 348.61705,681.92677 C 350.66553,662.08232 349.61280,651.81476 345.38586,650.40552 C 341.11809,648.98344 338.85695,625.05844 338.30087,575.44771 C 337.85188,535.37028 337.19931,499.47270 336.85033,495.67633 C 336.50160,491.88025 329.49825,485.86536 321.28725,482.31088 C 313.07601,478.75668 281.92791,459.93270 252.06918,440.48105 C 222.21013,421.02891 191.52114,401.39208 183.87127,396.84290 C 133.49682,366.88888 124.46817,360.26925 119.69471,349.79286 C 116.76210,343.35668 115.73006,332.86188 117.40135,326.47157 C 120.67613,313.94842 150.02036,298.99561 171.31939,298.99561 C 193.98911,298.99561 283.70453,345.54047 306.67461,369.21854 C 337.21744,400.70298 341.56028,398.58394 342.10451,351.92750 C 342.83096,289.58376 347.00900,244.11452 353.04962,232.82805 C 361.75423,216.56377 388.39869,202.84682 406.20899,205.46070 C 414.94310,206.74247 428.34657,214.32303 435.99472,222.30576 C 449.71591,236.62817 449.79227,237.17845 441.75712,263.83627 C 436.47140,281.37248 433.19462,318.47343 432.41831,369.57128 L 431.22198,448.29020 L 480.86221,472.72014 C 542.53674,503.07276 567.98968,513.96288 587.95883,518.54208 C 607.02397,522.91393 620.57660,535.57411 615.31209,544.09302 C 612.97535,547.87326 613.77435,548.94232 617.30486,546.76033 C 620.54614,544.75720 624.73530,545.60583 626.61370,548.64625 C 628.49281,551.68647 623.16479,556.85048 614.77414,560.12174 z " />
        </Svg>
        <Text>{location.title}</Text>
      </TouchableHighlight>
      <MaterialCommunityIcons onPress={() => createTwoButtonAlert(location)} style={styles.deleteIcon} name="delete" color={paperColors(theme).text} size={26} />
    </View>
  )
}

type Props = {
  painlog: PainLogType,
  theme: ThemeState['theme'],
  addNewPainLocation: (painlogLocation: PainLogLocation) => void
}

export const PainLog = ({
  painlog,
  theme,
  addNewPainLocation
}: Props) => {
  const [location, setLocation] = React.useState(emptyPainLogLocation);
  let figureFrontRef: React.Component<SvgProps, any, any> | null;
  let figureBackRef: React.Component<SvgProps, any, any> | null;
  const painLogArray = firebaseDocumentToArray(painlog);
  const addLocation = (e: GestureResponderEvent, ref: React.Component<SvgProps, any, any> | null, isBack: boolean = false) => {
    if (ref) {
      const element = ReactDOM.findDOMNode(ref);
      if (element && 'getBoundingClientRect' in element) {
        const { width, height } = element.getBoundingClientRect();
        const newLocation: PainLogLocation = {
          created: new Date(),
          position: {
            x: Math.round(e.nativeEvent.locationX / width * 10000) / 100,
            y: Math.round(e.nativeEvent.locationY / height * 10000) / 100,
          }
        }
        addNewPainLocation(newLocation)
      }
    }
  }
  return (
    <View>
      <ScrollView contentContainerStyle={{marginVertical:'auto'}}>
        {painLogArray.filter(p => p.active).map(p => (<Location location={p} theme={theme} onPress={() => setLocation(p)}/>))}
        <View style={styles.container}>
          <Svg
              ref={(f) => figureFrontRef = f}
              onPress={(e) => addLocation(e, figureFrontRef)} 
              x="0px" y="0px" viewBox="290 0 420 1000" enable-background="new 290 0 420 1000" style={styles.figure}>
            <Path d="M501.3,82.7c0,0-5,4.3-5.6,7.6l-0.1,1.3l1.6,3.8l1.6,0.5l2.5-1.6l2.5,1.6l1.6-0.5l1.7-3.8l-0.1-1.3C506.3,87,501.3,82.7,501.3,82.7z"/>
            <Path d="M471.8,75.4c1.1-5.6,7.4-9.1,13.9-7.8c6.5,1.3,10.9,7,9.8,12.6c-1.1,5.7-7.4,9.2-13.9,7.8C475.1,86.7,470.7,81.1,471.8,75.4z M506.4,80c-1.1-5.7,3.3-11.3,9.8-12.7c6.5-1.3,12.8,2.2,13.9,7.8c1.1,5.6-3.3,11.3-9.8,12.6C513.8,89.1,507.5,85.6,506.4,80z"/>
            <Path d="M683,495.5c-5.8-7.3-13.3-17-15.4-22.7c-3.5-9.8-6.1-41.2-6.1-41.2c-1.2-37.1-10.2-53.2-10.2-53.2c-15.7-25.2-18.6-71.9-18.6-71.9l-0.7-79c-5.5-53.9-45.3-54.3-45.3-54.3c-40.2-6-45.7-19-45.7-19c-8.5-12.2-3.6-35.7-3.6-35.7c7.1-5.8,9.8-21,9.8-21c11.7-8.9,11.2-22.2,5.8-22c-4.4,0.1-3.4-3.5-3.4-3.5C556.6,13,504.1,10,504.1,10h-8c0,0-52.6,3-45.2,62.1c0,0,1,3.6-3.4,3.5c-5.4-0.1-5.9,13,5.8,22c0,0,2.7,15.2,9.8,21c0,0,4.8,23.5-3.7,35.7c0,0-5.6,12.9-45.7,19c0,0-39.8,0.4-45.2,54.3l-0.7,79c0,0-2.9,46.8-18.6,71.9c0,0-9.1,16.1-10.2,53.2c0,0-2.6,31.4-6.2,41.2c-2.1,5.7-9.6,15.5-15.4,22.7c-11.4,14.3-30.6,44-20.4,47.3c0,0,8,0.7,18.6-20.2c0,0-0.2,8.1-8.7,31.5c-1.6,4.4-8.7,26.5,2.7,18.6c0,0,5.3-3.7,12.2-26.5c0,0-3.7,38.4,0.4,40.4c5.4,2.6,8.3-4.9,10.8-38.7c0,0,2.5-10.8,3.6,30.7c0.1,2.1,3.3,12.8,7.6,3.8c3.7-7.7,2-27.9,2-34.7c0,0,4.7,26.2,9.1,26.2c0,0,5.2,6.1,3.1-26.4c-0.4-5.3,1.4-16.3,1.7-19.5l0.5-12.6c0,0-1.3-14.3-1.3-20.3c0-1.5,5.1-21,18.6-41.5c0,0,28.1-49.8,26.3-82.4c0,0-0.4-31.1,10.9-48.6c0,0,8,88,2.6,112.7c0,0-25.3,60.6-19.7,105.9c4.1,33.7,12.1,105.7,20.1,134.1c4.2,14.6,1.7,51.8,5.1,61c1.5,4,0.7,7.7-2.6,16.9c-11.4,32-9.9,54.3,18.6,138.9c0,0,8.8,18.7,4.4,52.4c0,0-18.2,37.4-6.5,38.2c0,0,1,2.5,4.9,0.5c0,0,6.3,6.5,13.1,3c0,0,6.3,5,11.7,0.5c0,0,4.4,4.9,10.7,1c0,0,8.3,5.5,13.2-0.6c0,0,8.8,2-6.8-37.5c0,0-6-41.7-9.3-49.9c-6.2-15.7-1.8-58.2-0.5-67.4c2.2-15.3,1-41.3-2.9-61.5c-2.8-14.4,4.9-41.7,7.8-58.4c6-35.2,17.5-125.3,16.1-142.2l4.8,1.6c3.5,0,5.7-1.6,5.7-1.6c-1.4,17,10,107,16,142.2c2.8,16.7,10.6,44,7.8,58.4c-4,20.1-5.2,46.2-3,61.5c1.4,9.1,5.8,51.7-0.5,67.4c-3.3,8.2-9.2,49.9-9.2,49.9c-15.6,39.4-6.8,37.5-6.8,37.5c4.9,6.1,13.1,0.6,13.1,0.6c6.3,3.9,10.7-1,10.7-1c5.4,4.5,11.6-0.5,11.6-0.5c6.8,3.5,13.1-3,13.1-3c3.9,2,4.8-0.5,4.8-0.5c11.7-0.7-6.5-38.2-6.5-38.2c-4.4-33.6,4.4-52.4,4.4-52.4c28.5-84.6,29.9-106.9,18.6-138.9c-3.3-9.1-4-13-2.6-16.9c3.4-9.2,0.9-46.4,5-61c8-28.4,16-100.4,20.1-134.1c5.5-45.3-19.7-105.9-19.7-105.9c-5.5-24.7,2.5-112.7,2.5-112.7c11.4,17.5,10.9,48.6,10.9,48.6c-1.9,32.5,26.3,82.4,26.3,82.4c13.5,20.6,18.6,40.1,18.6,41.5c0,6-1.3,20.3-1.3,20.3l0.5,12.5c0.2,3.2,2,14.2,1.7,19.5c-2,32.5,3.1,26.4,3.1,26.4c4.4,0,9.1-26.2,9.1-26.2c0,6.8-1.6,27.1,2,34.7c4.4,9,7.5-1.6,7.6-3.8c1.2-41.5,3.6-30.6,3.6-30.6c2.4,33.7,5.4,41.3,10.8,38.7c4.1-2,0.4-40.4,0.4-40.4c6.9,22.8,12.2,26.5,12.2,26.5c11.5,7.9,4.3-14.3,2.7-18.6c-8.5-23.4-8.8-31.5-8.8-31.5c10.6,21,18.5,20.2,18.5,20.2C713.6,539.5,694.3,509.8,683,495.5z M526,98.5c-5.7,0.4-5,10.9-5,10.9c-0.9,8.2-4.5,8.2-4.5,8.2c-3.4,0.3-3.3-5-3.3-5c-0.1-5-0.9-5.6-0.9-5.6l-2.2,6.8c-0.7,5.2-4.6,4-4.6,4l-3.4-10.4l-2.3,4c-1,7.5-3.4,6.1-3.4,6.1c-4.4,0.4-3.7-6.4-3.7-6.4c0.1-5.9-2.4-3.4-2.4-3.4c-0.4,9.8-2.7,9.9-2.7,9.9c-4.5,0.8-4.9-4.4-4.9-4.4c-1.2-14.7-4.6-14.4-4.6-14.4l-11.2-1.1c-8.3-3.3-5.7-12.1-3.1-14.8c3.2-3.4,2.7-8.2,2.7-8.2c-5.3-16.3-1.8-28.1-1.8-28.1c7.1-23.1,25.5-26.2,36.8-26c12.5,0.2,18.3,3,23.3,6.3c15.7,10.1,16.2,30.4,13.4,40.7c-1.9,6.9-0.3,13.3-0.3,13.3c5.6,6.7,3.4,11.9,3.4,11.9C539.3,100.6,526,98.5,526,98.5z"/>
          </Svg>
          <Svg
              ref={(f) => figureBackRef = f}
              onPress={(e) => addLocation(e, figureBackRef, true)}
              x="0px" y="0px" viewBox="290 0 420 1000" enable-background="new 290 0 420 1000" style={styles.figure}>
            <Path d="m 683,495.5 c -5.8,-7.3 -13.3,-17 -15.4,-22.7 -3.5,-9.8 -6.1,-41.2 -6.1,-41.2 -1.2,-37.1 -10.2,-53.2 -10.2,-53.2 -15.7,-25.2 -18.6,-71.9 -18.6,-71.9 l -0.7,-79 c -5.5,-53.9 -45.3,-54.3 -45.3,-54.3 -40.2,-6 -45.7,-19 -45.7,-19 -8.5,-12.2 -3.6,-35.7 -3.6,-35.7 7.1,-5.8 9.8,-21 9.8,-21 11.7,-8.9 11.2,-22.2 5.8,-22 -4.4,0.1 -3.4,-3.5 -3.4,-3.5 7,-59 -45.5,-62 -45.5,-62 h -8 c 0,0 -52.6,3 -45.2,62.1 0,0 1,3.6 -3.4,3.5 -5.4,-0.1 -5.9,13 5.8,22 0,0 2.7,15.2 9.8,21 0,0 4.8,23.5 -3.7,35.7 0,0 -5.6,12.9 -45.7,19 0,0 -39.8,0.4 -45.2,54.3 l -0.7,79 c 0,0 -2.9,46.8 -18.6,71.9 0,0 -9.1,16.1 -10.2,53.2 0,0 -2.6,31.4 -6.2,41.2 -2.1,5.7 -9.6,15.5 -15.4,22.7 -11.4,14.3 -30.6,44 -20.4,47.3 0,0 8,0.7 18.6,-20.2 0,0 -0.2,8.1 -8.7,31.5 -1.6,4.4 -8.7,26.5 2.7,18.6 0,0 5.3,-3.7 12.2,-26.5 0,0 -3.7,38.4 0.4,40.4 5.4,2.6 8.3,-4.9 10.8,-38.7 0,0 2.5,-10.8 3.6,30.7 0.1,2.1 3.3,12.8 7.6,3.8 3.7,-7.7 2,-27.9 2,-34.7 0,0 4.7,26.2 9.1,26.2 0,0 5.2,6.1 3.1,-26.4 -0.4,-5.3 1.4,-16.3 1.7,-19.5 l 0.5,-12.6 c 0,0 -1.3,-14.3 -1.3,-20.3 0,-1.5 5.1,-21 18.6,-41.5 0,0 28.1,-49.8 26.3,-82.4 0,0 -0.4,-31.1 10.9,-48.6 0,0 8,88 2.6,112.7 0,0 -25.3,60.6 -19.7,105.9 4.1,33.7 12.1,105.7 20.1,134.1 4.2,14.6 1.7,51.8 5.1,61 1.5,4 0.7,7.7 -2.6,16.9 -11.4,32 -9.9,54.3 18.6,138.9 0,0 8.8,18.7 4.4,52.4 0,0 -18.2,37.4 -6.5,38.2 0,0 1,2.5 4.9,0.5 0,0 6.3,6.5 13.1,3 0,0 6.3,5 11.7,0.5 0,0 4.4,4.9 10.7,1 0,0 8.3,5.5 13.2,-0.6 0,0 8.8,2 -6.8,-37.5 0,0 -6,-41.7 -9.3,-49.9 -6.2,-15.7 -1.8,-58.2 -0.5,-67.4 2.2,-15.3 1,-41.3 -2.9,-61.5 -2.8,-14.4 4.9,-41.7 7.8,-58.4 6,-35.2 17.5,-125.3 16.1,-142.2 l 4.8,1.6 c 3.5,0 5.7,-1.6 5.7,-1.6 -1.4,17 10,107 16,142.2 2.8,16.7 10.6,44 7.8,58.4 -4,20.1 -5.2,46.2 -3,61.5 1.4,9.1 5.8,51.7 -0.5,67.4 -3.3,8.2 -9.2,49.9 -9.2,49.9 -15.6,39.4 -6.8,37.5 -6.8,37.5 4.9,6.1 13.1,0.6 13.1,0.6 6.3,3.9 10.7,-1 10.7,-1 5.4,4.5 11.6,-0.5 11.6,-0.5 6.8,3.5 13.1,-3 13.1,-3 3.9,2 4.8,-0.5 4.8,-0.5 11.7,-0.7 -6.5,-38.2 -6.5,-38.2 -4.4,-33.6 4.4,-52.4 4.4,-52.4 28.5,-84.6 29.9,-106.9 18.6,-138.9 -3.3,-9.1 -4,-13 -2.6,-16.9 3.4,-9.2 0.9,-46.4 5,-61 8,-28.4 16,-100.4 20.1,-134.1 C 607.7,496 582.5,435.4 582.5,435.4 577,410.7 585,322.7 585,322.7 c 11.4,17.5 10.9,48.6 10.9,48.6 -1.9,32.5 26.3,82.4 26.3,82.4 13.5,20.6 18.6,40.1 18.6,41.5 0,6 -1.3,20.3 -1.3,20.3 L 640,528 c 0.2,3.2 2,14.2 1.7,19.5 -2,32.5 3.1,26.4 3.1,26.4 4.4,0 9.1,-26.2 9.1,-26.2 0,6.8 -1.6,27.1 2,34.7 4.4,9 7.5,-1.6 7.6,-3.8 1.2,-41.5 3.6,-30.6 3.6,-30.6 2.4,33.7 5.4,41.3 10.8,38.7 4.1,-2 0.4,-40.4 0.4,-40.4 6.9,22.8 12.2,26.5 12.2,26.5 11.5,7.9 4.3,-14.3 2.7,-18.6 -8.5,-23.4 -8.8,-31.5 -8.8,-31.5 10.6,21 18.5,20.2 18.5,20.2 10.7,-3.4 -8.6,-33.1 -19.9,-47.4 z"/>
          </Svg>
        </View>
      </ScrollView>
      <Portal>
        <Modal visible={location !== emptyPainLogLocation}>
          <NewPainLogLocation
            value={location}
            painlog={painlog}
            theme={theme}
            saveNewPainLogLocation={(loc?: PainLogLocation)=> {
              if (loc) {
                addPainLogLocation(loc)
              }
              setLocation(emptyPainLogLocation);
            }} />
        </Modal>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  description: {
    fontSize: 16,
    lineHeight: 22,
    padding:3,
  },
  button: {
    padding: 16,
    alignItems: 'center',
    paddingVertical: 16,
  },
  buttonRow: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical:24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#AAA',
  },
  buttonContents : {
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 'auto'
  },
  figure: {
    flex: 1,
    resizeMode: 'cover',
  },
  location: {
    position: 'absolute'
  },
  deleteIcon: {
    fontSize: 20,
    width:'10%',
    paddingVertical: 8,
    paddingHorizontal:4,
  },
});

interface OwnProps {
}

interface DispatchProps {
  addNewPainLocation: (painlogLocation: PainLogLocation) => void
}

const mapStateToProps = (state: State) => {
  return {
    user: state.user,
    theme: state.theme,
    painlog: state.painlog
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    addNewPainLocation: (painlogLocation: PainLogLocation) => {
      dispatch(addPainLogLocation(painlogLocation))
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(PainLog)
