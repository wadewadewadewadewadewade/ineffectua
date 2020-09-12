import * as React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slider} from '@react-native-community/slider';
import { Text, Button, TextInput } from 'react-native-paper';
import { PainLogLocation, PainLogState } from '../../reducers/PainLogReducer';
import { ThemeState, paperColors } from '../../reducers/ThemeReducer';
import { emptyPainLogLocation, addPainLogLocation } from '../../middleware/PainLogMiddleware';
import SettingsItem from '../shared/SettingsItem';
import DataTypes from '../shared/DataTypes';
import Medications from '../shared/Medications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { State } from '../../Types';

type NewPainLogLocationProps = {
  value?: PainLogLocation
  painlog: PainLogState['painlog'],
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
        minimumTrackImage={() => <MaterialCommunityIcons name="emoticon-happy-outline" color={paperColors(theme).text} size={26}/>}
        maximumTrackImage={() => <MaterialCommunityIcons name="emoticon-dead-outline" color={paperColors(theme).text} size={26}/>}
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
          saveNewPainLogLocation(newPainLogLocation, value?.key)
        }}>
        <Text style={styles.buttonContents}>{buttonLabel} Medication</Text>
      </TouchableOpacity>
      <Button onPress={() => saveNewPainLogLocation()} style={{paddingVertical:8}}><Text>Cancel</Text></Button>
    </SafeAreaView>
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
});

interface OwnProps {
}

interface DispatchProps {
  saveNewPainLogLocation: (painLogLocation?: PainLogLocation, previousPainLogId?: string) => void
}

const mapStateToProps = (state: State) => {
  return {
    user: state.user,
    theme: state.theme,
    contacts: state.contacts
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    saveNewPainLogLocation: (painLogLocation?: PainLogLocation, previousPainLogId?: string) => {
      painLogLocation && dispatch(addPainLogLocation(painLogLocation, previousPainLogId))
    }
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(NewPainLogLocation)