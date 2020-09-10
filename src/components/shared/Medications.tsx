import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import { Text, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addMedication, emptyMedication, medicationsToArray, newMedicationName } from '../../middleware/MedicationsMiddleware';
import { Medication, State } from '../../Types';
import { ThemeState, paperColors } from '../../reducers/ThemeReducer';
import { MedicationsState } from '../../reducers/MedicationsReducer';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DataTypes from './DataTypes';
import Contacts from './Contacts';
import Picker from '../shared/ChronoPicker';
import SettingsItem from './SettingsItem';
import { formatDateAndTime } from '../../middleware/CalendarMiddleware'

type NewMedicationProps = {
  value?: Medication
  medications: MedicationsState['medications'],
  theme: ThemeState['theme'],
  saveNewMedication: (medication?: Medication) => void
}

export const NewMedication = ({
  value,
  medications,
  theme,
  saveNewMedication
}: NewMedicationProps) => {
  console.log({theme})
  const [name, setName] = React.useState(value?.name || '');
  const [active, setActive] = React.useState(value?.active || false);
  const [nameTouched, setNameTouched] = React.useState(false);
  const [showPicker, setShowPicker] = React.useState(false);
  const [typeId, setTypeId] = React.useState(value?.typeId || '');
  const [prescribed, setPrescribed] = React.useState(value?.prescribed || '');
  const [lastFilled, setLastFilled] = React.useState(value?.lastFilled || undefined);
  const [refills, setRefills] = React.useState(value?.refills || undefined);
  const [description, setDescription] = React.useState(value?.description || '');
  const newMedication: Medication = {
    name,
    active,
    typeId,
    prescribed,
    lastFilled,
    refills,
    description
  };
  const buttonLabel = !value || value === emptyMedication ? 'Add New' : 'Edit';
  const medicationsArray = medicationsToArray(medications);
  const nameExists = medicationsArray.filter(c => c.name === name);
  const [descriptionHeight, setDescriptionHeight] = React.useState(1);
  return (
    <SafeAreaView style={{backgroundColor: theme.paper.colors.surface}}>
      <TextInput
        ref={(input) => {
          if (!nameTouched) {
            input?.focus();
          }
        }}
        value={name}
        onChangeText={(text) => {
          setName(text)
          if (!nameTouched) {
            setNameTouched(true)
          }
        }}
        placeholder="Name" />
      <SettingsItem label="Active" value={active} onValueChange={(val) => setActive(val)} />
      <DataTypes
        value={typeId}
        onValueChange={(dt) => dt.key && setTypeId(dt.key)}
        />
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{width:'20%',marginLeft:16}}>Prescriber</Text>
        <Contacts
          value={[prescribed]}
          limit={1}
          onValueChange={(cId) => setPrescribed(cId[0])}
          />
      </View>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <View style={{...styles.buttonRow, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#AAA'}}>
          <Text style={{color: theme.paper.colors.text}}>Last Filled</Text>
          <Text>{lastFilled ? formatDateAndTime(lastFilled) : 'unknown'}</Text>
        </View>
      </TouchableOpacity>
      {showPicker && <Picker
        value={lastFilled}
        onResult={(d?: Date) => {
          if (d) {
            setLastFilled(d)
          }
          setShowPicker(false)
      }}/>}
      <TextInput
        value={refills?.toString()}
        keyboardType="number-pad"
        onChangeText={(text) => setRefills(parseInt(text, 10))}
        placeholder="Optional Refills" />
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
          typeof name === 'string' && name.length && nameExists.length === 0 && saveNewMedication(newMedication)
        }}>
        <Text style={styles.buttonContents}>{buttonLabel} Medication</Text>
      </TouchableOpacity>
      <Button onPress={() => saveNewMedication()} style={{paddingVertical:8}}><Text>Cancel</Text></Button>
    </SafeAreaView>
  )
}

type Props = {
  value?: Array<string>;
  onValueChange: (medications: Array<string>) => void;
  theme: ThemeState['theme'],
  medications: MedicationsState['medications'],
  addNewMedication: (medication: Medication, onComplete: (medication: Medication) => void) => void
};

const Medications = ({
  value,
  onValueChange,
  theme,
  medications,
  addNewMedication
}: Props) => {
  const [visible, setVisible] = React.useState(false);
  const [newMedications, setNewMedications] = React.useState(value || new Array<string>());
  const medicationsArray = medicationsToArray(medications, true);
  let pickerRef: RNPickerSelect | null = null;
  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Text style={{color: theme.paper.colors.text}}>Medication</Text>
      {newMedications && newMedications.map((cId: string) => medications[cId] && 
        <View style={styles.existingMedications}>
          <Text style={styles.existingMedicationsText}>{medications[cId].name}</Text>
          <MaterialCommunityIcons onPress={() => {
            setNewMedications(newMedications.filter(c => c !== cId))
          }} style={styles.existingMedicationsIcon} name="delete" color={paperColors(theme).text} size={26} />
        </View>)}
      <View style={styles.pickerView}>
        <RNPickerSelect
          ref={(r) => pickerRef = r}
          style={pickerStyles}
          items={medicationsArray.map(c => ({label:c.name,value:c.name}))}
          onValueChange={(itemValue, itemIndex) => {
            if (itemValue) {
              const sel = medicationsArray.filter(c => c.name === itemValue.toString())[0];
              if (sel.name === newMedicationName) {
                setVisible(true);
              } else if (sel.key) {
                setNewMedications([...newMedications, sel.key]);
                if (pickerRef) {
                  pickerRef.setState({value:undefined})
                  pickerRef.forceUpdate()
                }
                onValueChange([...newMedications, sel.key]);
              }
            }
          }}
          />
      </View>
      <Portal>
        <Modal visible={visible}>
          <NewMedication
            value={emptyMedication}
            medications={medications}
            theme={theme}
            saveNewMedication={(medication?: Medication)=> {
              if (medication) {
                addNewMedication(medication, (c: Medication) => {
                  if (c.key) {
                    setVisible(false);
                    setNewMedications([...newMedications, c.key]);
                    onValueChange(newMedications);
                  }
                })
              } else {
                setVisible(false)
              }
            }} />
        </Modal>
      </Portal>
    </View>
  );
}

const pickerStyles: PickerStyle = {
  inputIOS: {
    textAlign: 'right',
  },
  inputAndroid: {
    textAlign: 'right',
  }
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
  existingMedications: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal:8,
    fontSize: 20,
    justifyContent:'flex-end',
    marginLeft:'20%'
  },
  existingMedicationsText: {
    flex:1,
    fontSize: 16,
    width:'90%',
    alignSelf:'flex-start',
    paddingVertical: 8,
  },
  existingMedicationsIcon: {
    fontSize: 20,
    width:'10%',
    paddingVertical: 8,
    paddingHorizontal:4,
  },
  pickerView: {
    flex:1,
    width:'80%',
    alignSelf:'flex-end'
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
  addNewMedication: (Medication: Medication, onComplete: (medication: Medication) => void) => void
}

const mapStateToProps = (state: State) => {
  return {
    user: state.user,
    theme: state.theme,
    medications: state.medications
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    addNewMedication: (medication: Medication, onComplete: (medication: Medication) => void) => {
      dispatch(addMedication(medication, onComplete))
    }
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Medications);