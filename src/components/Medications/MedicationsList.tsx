import * as React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Modal, Portal, FAB } from 'react-native-paper';
import { useScrollToTop } from '@react-navigation/native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { State } from '../../Types';
import { addMedication, medicationsToArray, emptyMedication } from '../../middleware/MedicationsMiddleware';
import { ThemeState } from '../../reducers/ThemeReducer';
import { MedicationsState, Medication } from '../../reducers/MedicationsReducer';
import { NewMedication } from '../shared/Medications'
import { TouchableHighlight } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MedicationItem = React.memo((
  { item, theme, onPress }:
  { item: Medication, theme: ThemeState['theme'], onPress: (medication: Medication) => void }
) => {
    const { colors } = theme.navigation;

    return (
      <TouchableHighlight onPress={() => onPress(item)} style={styles.existingMedication}>
        <View style={[styles.item, { backgroundColor: colors.card }]}>
          <View style={styles.avatar}>
            <Text style={styles.letter}>
              {item.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.number, { color: colors.text, opacity: 0.5 }]}>
              {item.refills}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
);

const ItemSeparator = (theme: ThemeState['theme']) => {
  const { colors } = theme.navigation;

  return (
    <View style={[styles.separator, { backgroundColor: colors.border }]} />
  );
};

type Props = {
  theme: ThemeState['theme'],
  medications: MedicationsState['medications'],
  addNewMedication: (medication: Medication, onComplete: (medication: Medication) => void) => void
}

export const MedicationsList = ({
  theme,
  medications,
  addNewMedication
}: Props) => {
  let dummyForType: Medication | undefined;
  const [addOrEditMedicationId, setAddOrEditMedicationId] = React.useState(dummyForType);

  const ref = React.useRef<FlatList<Medication>>(null);

  useScrollToTop(ref);

  const renderItem = ({ item }: { item: Medication }) => <MedicationItem
    item={item}
    theme={theme}
    onPress={(medication: Medication) => {
      setAddOrEditMedicationId(medication)
    }} />;

  return (
    <View
      style={styles.container}
    >
      <FlatList
        ref={ref}
        data={medicationsToArray(medications)}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => ItemSeparator(theme)}
      />
      {addOrEditMedicationId === undefined && <FAB
        style={styles.fab}
        small
        icon={() => <MaterialCommunityIcons name="plus" size={24} />}
        onPress={() => setAddOrEditMedicationId(emptyMedication)}
      />}
      <Portal>
        <Modal visible={addOrEditMedicationId !== undefined}>
          <NewMedication
            value={addOrEditMedicationId}
            medications={medications}
            theme={theme}
            saveNewMedication={(medication?: Medication)=> {
              if (medication) {
                addNewMedication(medication, (m: Medication) => {
                  if (m.key) {
                    setAddOrEditMedicationId(undefined);
                    //setNewMedications([...newMedications, c.key]);
                    //onValueChange(newMedications);
                  }
                })
              } else {
                setAddOrEditMedicationId(undefined);
              }
            }} />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height:'100%',
  },
  existingMedication: {
    display:'flex',
    backgroundColor: '#0f0',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#e91e63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: 'white',
    fontWeight: 'bold',
  },
  details: {
    margin: 8,
    width:'100%',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  number: {
    fontSize: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
};
export default connect(mapStateToProps, mapDispatchToProps)(MedicationsList);