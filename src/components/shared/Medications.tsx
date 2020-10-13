import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import { Text, Button, Modal, Portal, TextInput, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { addMedication, emptyMedication, newMedicationName, getMedicationsByUserId } from '../../middleware/MedicationsMiddleware';
import { State } from '../../Types';
import { ThemeState, paperColors } from '../../reducers/ThemeReducer';
import { Medication, MedicationsState } from '../../reducers/MedicationsReducer';
import { TouchableOpacity, FlatList } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DataTypes from './DataTypes';
import Contacts from './Contacts';
import Picker from '../shared/ChronoPicker';
import SettingsItem from './SettingsItem';
import { formatDateAndTime } from '../../middleware/CalendarMiddleware'
import { firebaseDocumentToArray } from '../../firebase/utilities';
import FlexableTextArea from './FlexableTextArea';

type NewMedicationProps = {
  value?: Medication
  medications: MedicationsState['medications'],
  theme: ThemeState['theme'],
  saveNewMedication: (medication?: Medication) => void
}

export const NewMedication = ({
  value,
  saveNewMedication,
}: NewMedicationProps) => {
  const [theme, medications] = useSelector((state: State) => [state.theme, state.medications])
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
  const medicationsArray = firebaseDocumentToArray(medications);
  const nameExists = medicationsArray.filter(c => c.name === name);
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
      <FlexableTextArea
        value={description}
        onChangeText={(text) => setDescription(text)} />
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
  value?: Array<string>,
  display?: 'list',
  userId?: string,
  onValueChange?: (medications: Array<string>) => void,
};

const MedicationItem = ({
  medication
} : {
  medication: Medication
}) => {
  return (
    <View style={styles.medicationItem}>
      <Text style={styles.medicationItemName}>{medication.name}</Text>
    </View>
  )
}

const Medications = ({
  value,
  display,
  userId,
  onValueChange,
}: Props) => {
  const [theme, stateMedications] = useSelector((state: State) => [state.theme, state.medications])
  const dispatch = useDispatch()
  const [ready, setReady] = React.useState(false)
  const [medications, setMedications] = React.useState(stateMedications)
  React.useEffect(() => {
    const getMedications = async () => {
      try {
        if (userId !== undefined) {
          getMedicationsByUserId(userId).then(m => setMedications(m)).then(() => setReady(true))
        } else {
          setReady(true)
        }
      } catch (e) {
        console.error('Medications', e)
        setReady(true)
      }
    }

    !ready && getMedications();
  }, [ready]);
  const addNewMedication = React.useCallback(
    (medication: Medication, onComplete: (medication: Medication) => void) => dispatch(addMedication(medication, onComplete)),
    [dispatch]
  )
  const [visible, setVisible] = React.useState(false);
  const [newMedications, setNewMedications] = React.useState(value || new Array<string>());
  if (!ready || medications === undefined) {
    return (
      <ActivityIndicator />
    )
  } else {
    const medicationsArray = firebaseDocumentToArray(medications, userId ? undefined : {name:newMedicationName,active:true});
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
        <View
          style={{
            flexDirection: display === 'list' ? 'column' : 'row',
            alignItems: display === 'list' ? 'flex-start' : 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{color: theme.paper.colors.text}}>Medication{display === 'list' && medicationsArray.length > 1 && 's'}</Text>
          {display === 'list' ?
            <SafeAreaView style={{paddingLeft:12}}>
              <FlatList
                data={medicationsArray}
                keyExtractor={i => i.key || i.name}
                renderItem={({item, index}) => (<MedicationItem medication={item} />)}
              />
            </SafeAreaView>
          : <View style={styles.pickerView}>
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
                      onValueChange && onValueChange([...newMedications, sel.key]);
                    }
                  }
                }}
                />
            </View>
          }
        </View>
        {newMedications && newMedications.map((cId: string) => medications[cId] && 
          <View key={cId} style={styles.existingMedications}>
            <Text style={styles.existingMedicationsText}>{medications[cId].name}</Text>
            <MaterialCommunityIcons onPress={() => {
              setNewMedications(newMedications.filter(c => c !== cId))
            }} style={styles.existingMedicationsIcon} name="delete" color={paperColors(theme).text} size={26} />
          </View>)}
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
                      onValueChange && onValueChange(newMedications);
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
    alignSelf:'flex-end',
    width:'80%',
  },
  buttonContents : {
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  medicationItem: {
    flex: 1,
    flexDirection: 'row',
  },
  medicationItemName: {
    fontSize: 12,
  },
});

export default Medications;