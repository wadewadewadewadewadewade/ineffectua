import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import RNPickerSelect, {PickerStyle} from 'react-native-picker-select';
import {
  Text,
  Button,
  Modal,
  Portal,
  TextInput,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {
  addMedication,
  emptyMedication,
  newMedicationName,
  getMedications,
} from '../../middleware/MedicationsMiddleware';
import {State} from '../../Types';
import {ThemeState, paperColors, Theme} from '../../reducers/ThemeReducer';
import {
  Medication,
  MedicationsState,
  MedicationsType,
} from '../../reducers/MedicationsReducer';
import {
  TouchableOpacity,
  FlatList,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import DataTypes from './DataTypes';
import Contacts from './Contacts';
import Picker from '../shared/ChronoPicker';
import SettingsItem from './SettingsItem';
import {formatDateAndTime} from '../../middleware/CalendarMiddleware';
import {firebaseDocumentToArray} from '../../firebase/utilities';
import FlexableTextArea from './FlexableTextArea';
import {
  useQueryCache,
  useQuery,
  useMutation,
  queryCache,
  QueryStatus,
} from 'react-query';
import {navigate} from '../RootNavigation';

type NewMedicationProps = {
  value?: Medication;
  medications: MedicationsState['medications'];
  theme: ThemeState['theme'];
  saveNewMedication: (medication?: Medication) => void;
};

export const NewMedication = ({
  value,
  saveNewMedication,
}: NewMedicationProps) => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const [name, setName] = React.useState(value?.name || '');
  const [active, setActive] = React.useState(value?.active || false);
  const [nameTouched, setNameTouched] = React.useState(false);
  const [showPicker, setShowPicker] = React.useState(false);
  const [typeId, setTypeId] = React.useState(value?.typeId || '');
  const [prescribed, setPrescribed] = React.useState(value?.prescribed || '');
  const [lastFilled, setLastFilled] = React.useState(
    value?.lastFilled || undefined,
  );
  const [refills, setRefills] = React.useState(value?.refills || undefined);
  const [description, setDescription] = React.useState(
    value?.description || '',
  );
  const newMedication: Medication = {
    key: '',
    created: new Date(-1),
    name,
    active,
    typeId,
    prescribed,
    lastFilled,
    refills,
    description,
  };
  const buttonLabel = !value || value === emptyMedication ? 'Add New' : 'Edit';
  const {data} = useQuery<MedicationsType, Error, [string, number | undefined]>(
    'users/medications',
    () => getMedications(user),
    {suspense: false},
  );
  const medications = data || {};
  const medicationsArray = firebaseDocumentToArray(medications);
  const nameExists = medicationsArray.filter((c) => c.name === name);
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
          setName(text);
          if (!nameTouched) {
            setNameTouched(true);
          }
        }}
        placeholder="Name"
      />
      <SettingsItem
        label="Active"
        value={active}
        onValueChange={(val) => setActive(val)}
      />
      <Divider />
      <DataTypes
        value={typeId}
        onValueChange={(dt) => dt.key && setTypeId(dt.key)}
      />
      <Divider />
      <View style={styles.rowContainer}>
        <Text style={styles.label}>Prescriber</Text>
        <Contacts
          value={[prescribed]}
          limit={1}
          onValueChange={(cId) => setPrescribed(cId[0])}
        />
      </View>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <View
          style={[
            styles.buttonRow,
            {
              borderTopWidth: StyleSheet.hairlineWidth,
            },
          ]}>
          <Text style={{color: theme.paper.colors.text}}>Last Filled</Text>
          <Text>{lastFilled ? formatDateAndTime(lastFilled) : 'unknown'}</Text>
        </View>
      </TouchableOpacity>
      {showPicker && (
        <Picker
          value={lastFilled}
          onResult={(d?: Date) => {
            if (d) {
              setLastFilled(d);
            }
            setShowPicker(false);
          }}
        />
      )}
      <TextInput
        value={refills?.toString()}
        keyboardType="number-pad"
        onChangeText={(text) => setRefills(parseInt(text, 10))}
        placeholder="Optional Refills"
      />
      <FlexableTextArea
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <TouchableOpacity
        style={{backgroundColor: theme.paper.colors.accent}}
        onPress={() => {
          typeof name === 'string' &&
            name.length &&
            nameExists.length === 0 &&
            saveNewMedication(newMedication);
        }}>
        <View style={styles.button}>
          <Text style={styles.buttonContents}>{buttonLabel} Medication</Text>
        </View>
      </TouchableOpacity>
      <Button onPress={() => saveNewMedication()} style={styles.saveButton}>
        <Text>Cancel</Text>
      </Button>
    </SafeAreaView>
  );
};

const MedicationItem = ({medication}: {medication: Medication}) => {
  return (
    <View style={styles.medicationItem}>
      <Text style={styles.medicationItemName}>{medication.name}</Text>
    </View>
  );
};

const SideBar = ({
  medications,
  theme,
}: {
  medications: MedicationsType;
  theme: Theme;
}) => {
  const medicationsArray = firebaseDocumentToArray<Medication>(medications);
  return (
    <View style={styles.container}>
      <TouchableHighlight
        onPress={() => {
          navigate('Medications');
        }}>
        <View style={styles.row}>
          <Text style={[styles.labelFont, {color: theme.paper.colors.text}]}>
            Medications
          </Text>
          <MaterialCommunityIcons
            style={styles.navigateIcon}
            name="chevron-right"
            color={paperColors(theme).text}
            size={26}
          />
        </View>
      </TouchableHighlight>
      <SafeAreaView style={styles.sidebarInset}>
        <FlatList
          data={medicationsArray}
          keyExtractor={(i) => i.key || i.name}
          renderItem={({item, index}) => <MedicationItem medication={item} />}
        />
      </SafeAreaView>
    </View>
  );
};

type Props = {
  value?: Array<string>;
  display?: 'list' | 'summary' | 'component';
  userId?: string;
  onValueChange?: (medications: Array<string>) => void;
};

const MedicationsComponent = ({
  value,
  display,
  userId,
  onValueChange,
}: Props) => {
  const [theme, user] = useSelector((state: State) => [
    state.theme,
    state.user,
  ]);
  const cache = useQueryCache();
  const fetchDataTypes = (path: string) => getMedications(user);
  const {data, status, error} = useQuery<
    MedicationsType,
    Error,
    [string, number | undefined]
  >('users/medications', fetchDataTypes, {suspense: true});
  const [saveMedication] = useMutation(
    (m: Medication) => addMedication(user, m),
    {
      onSuccess: (m) => {
        queryCache.setQueryData<MedicationsType>('users/medications', (old) => {
          const newMedicationsType: MedicationsType = {};
          if (m.key) {
            newMedicationsType[m.key] = m;
          }
          if (old) {
            return {...old, ...newMedicationsType};
          } else {
            return newMedicationsType;
          }
        });
      },
      onSettled: () => cache.invalidateQueries('users/medications'),
    },
  );
  const medications = data || {};
  const [visible, setVisible] = React.useState(false);
  const [newMedications, setNewMedications] = React.useState(
    value || new Array<string>(),
  );
  const medicationsArray = firebaseDocumentToArray(
    medications,
    userId
      ? undefined
      : {name: newMedicationName, active: true, key: '', created: new Date(-1)},
  );
  let pickerRef: RNPickerSelect | null = null;
  if (!user) {
    return <View />;
  } else if (status === QueryStatus.Loading) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching posts: {error?.message}</Text>;
  } else {
    if (display === 'list') {
      return <SideBar theme={theme} medications={medications} />;
    } else if (display === 'summary') {
      return (
        <View style={styles.container}>
          <TouchableHighlight
            onPress={() => {
              navigate('Medications');
            }}>
            <View style={styles.row}>
              <Text
                style={[styles.labelFont, {color: theme.paper.colors.text}]}>
                Medications
              </Text>
              <MaterialCommunityIcons
                style={styles.navigateIcon}
                name="chevron-right"
                color={paperColors(theme).text}
                size={26}
              />
            </View>
          </TouchableHighlight>
          {medicationsArray.map((m) => (
            <MedicationItem key={m.key} medication={m} />
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <View style={styles.spaceBetween}>
            <Text style={{color: theme.paper.colors.text}}>Medication</Text>
            <View style={styles.pickerView}>
              <RNPickerSelect
                ref={(r) => (pickerRef = r)}
                style={pickerStyles}
                items={medicationsArray.map((c) => ({
                  label: c.name,
                  value: c.name,
                }))}
                onValueChange={(itemValue, itemIndex) => {
                  if (itemValue) {
                    const sel = medicationsArray.filter(
                      (c) => c.name === itemValue.toString(),
                    )[0];
                    if (sel.name === newMedicationName) {
                      setVisible(true);
                    } else if (sel.key) {
                      setNewMedications([...newMedications, sel.key]);
                      if (pickerRef) {
                        pickerRef.setState({value: undefined});
                        pickerRef.forceUpdate();
                      }
                      onValueChange &&
                        onValueChange([...newMedications, sel.key]);
                    }
                  }
                }}
              />
            </View>
          </View>
          {newMedications &&
            newMedications.map(
              (mId: string) =>
                medications[mId] && (
                  <View key={mId} style={styles.existingMedications}>
                    <Text style={styles.existingMedicationsText}>
                      {medications[mId].name}
                    </Text>
                    <MaterialCommunityIcons
                      onPress={() => {
                        setNewMedications(
                          newMedications.filter((c) => c !== mId),
                        );
                      }}
                      style={styles.existingMedicationsIcon}
                      name="delete"
                      color={paperColors(theme).text}
                      size={26}
                    />
                  </View>
                ),
            )}
          <Portal>
            <Modal visible={visible}>
              <NewMedication
                value={emptyMedication}
                medications={medications}
                theme={theme}
                saveNewMedication={(medication?: Medication) => {
                  if (medication) {
                    saveMedication(medication).then(
                      (m: Medication | undefined) => {
                        if (m && m.key) {
                          setVisible(false);
                          setNewMedications([...newMedications, m.key]);
                          onValueChange && onValueChange(newMedications);
                        }
                      },
                    );
                  } else {
                    setVisible(false);
                  }
                }}
              />
            </Modal>
          </Portal>
        </View>
      );
    }
  }
};

export const Medications = (props: Props) => {
  return (
    <View>
      <React.Suspense fallback={<ActivityIndicator />}>
        <MedicationsComponent {...props} />
      </React.Suspense>
    </View>
  );
};

const pickerStyles: PickerStyle = {
  inputIOS: {
    textAlign: 'right',
  },
  inputAndroid: {
    textAlign: 'right',
  },
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  labelFont: {
    fontSize: 16,
  },
  sidebarInset: {
    paddingLeft: 12,
  },
  saveButton: {
    paddingVertical: 8,
  },
  navigateIcon: {
    fontSize: 16,
  },
  label: {
    width: '20%',
    marginLeft: 16,
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
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
    borderTopColor: '#AAA',
    borderTopWidth: 0,
  },
  existingMedications: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 20,
    justifyContent: 'flex-end',
    marginLeft: '20%',
  },
  existingMedicationsText: {
    flex: 1,
    fontSize: 16,
    width: '90%',
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  existingMedicationsIcon: {
    fontSize: 20,
    width: '10%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  goIcon: {
    fontSize: 20,
    width: '10%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pickerView: {
    alignSelf: 'flex-end',
    width: '80%',
  },
  buttonContents: {
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
