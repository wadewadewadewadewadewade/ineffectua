import * as React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Linking,
  GestureResponderEvent,
  Platform,
  Alert,
} from 'react-native';
import {Text, Modal, Portal, FAB, ActivityIndicator} from 'react-native-paper';
import {
  useScrollToTop,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {State} from '../../Types';
import {
  addMedication,
  emptyMedication,
  getMedications,
  deleteMedication,
} from '../../middleware/MedicationsMiddleware';
import {ThemeState, paperColors} from '../../reducers/ThemeReducer';
import {Medication, MedicationsType} from '../../reducers/MedicationsReducer';
import {NewMedication} from '../shared/Medications';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {firebaseDocumentToArray} from '../../firebase/utilities';
import {
  useQueryCache,
  useQuery,
  useMutation,
  queryCache,
  QueryStatus,
} from 'react-query';

const MedicationItem = React.memo(
  ({
    item,
    onPress,
  }: {
    item: Medication;
    onPress: (medication: Medication) => void;
  }) => {
    const [user, theme] = useSelector((state: State) => [
      state.user,
      state.theme,
    ]);
    const {colors} = theme.navigation;
    const cache = useQueryCache();
    const [mutateDelete] = useMutation(
      (medication: Medication) => deleteMedication(user, medication),
      {
        onSuccess: (d, v) => {
          queryCache.setQueryData(
            'users/medications',
            (old: MedicationsType | undefined) => {
              if (old !== undefined) {
                const keyToRemove = v.key;
                const {[keyToRemove]: removed, ...rest} = old;
                return rest as MedicationsType;
              } else {
                return {};
              }
            },
          );
        },
        onSettled: () => cache.invalidateQueries('users/medications'),
      },
    );
    const createTwoButtonAlert = (e: GestureResponderEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (Platform.OS === 'web') {
        // Alert doesn't seem to work in expo/web https://github.com/expo/expo/issues/6560
        // TODO: add window.confirm to clobal namespace so we can use confirm() on desktop
        mutateDelete(item);
      } else {
        Alert.alert(
          'Delete post',
          'Are you sure? This action is not reversable.',
          [
            {
              text: 'Cancel',
              //onPress: () => console.log("Cancel Pressed"),
              style: 'cancel',
            },
            {text: 'OK', onPress: () => mutateDelete(item)},
          ],
          {cancelable: true},
        );
      }
    };
    return (
      <View style={[styles.item, {backgroundColor: colors.card}]}>
        <TouchableHighlight
          onPress={() => onPress(item)}
          containerStyle={styles.existingMedication}>
          <View style={styles.rowWide}>
            <View style={styles.avatar}>
              <Text style={styles.letter}>
                {item.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.name, {color: colors.text}]}>
                {item.name}
              </Text>
              <Text style={[styles.number, {color: colors.text}]}>
                {item.refills + ' refill'}
                {item.refills !== 1 && 's'}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
        <View style={styles.links}>
          <MaterialCommunityIcons
            style={styles.icon}
            onPress={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const url =
                'https://en.wikipedia.org/wiki/' +
                encodeURIComponent(item.name);
              Linking.canOpenURL(url).then((val) => {
                if (val) {
                  Linking.openURL(url);
                } else {
                  // TODO: message about inability to open URL
                }
              });
            }}
            name="information"
            color={paperColors(theme).text}
            size={26}
          />
          <MaterialCommunityIcons
            style={styles.icon}
            name={'delete'}
            onPress={createTwoButtonAlert}
            color={paperColors(theme).text}
            size={26}
          />
        </View>
      </View>
    );
  },
);

const ItemSeparator = (theme: ThemeState['theme']) => {
  const {colors} = theme.navigation;

  return <View style={[styles.separator, {backgroundColor: colors.border}]} />;
};

export const MedicationsList = () => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  let dummyForType: Medication | undefined;
  const [addOrEditMedicationId, setAddOrEditMedicationId] = React.useState(
    dummyForType,
  );
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
          const newMedciationType: MedicationsType = {};
          if (m.key) {
            newMedciationType[m.key] = m;
          }
          if (old) {
            return {...old, ...newMedciationType};
          } else {
            return newMedciationType;
          }
        });
      },
      onSettled: () => cache.invalidateQueries('users/medications'),
    },
  );
  const medications = data || {};
  const ref = React.useRef<FlatList<Medication>>(null);
  useScrollToTop(ref);
  if (!user) {
    return <View />;
  } else if (status === QueryStatus.Loading) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching posts: {error?.message}</Text>;
  } else {
    return (
      <View style={styles.container}>
        <FlatList
          ref={ref}
          data={firebaseDocumentToArray(medications)}
          keyExtractor={(_, i) => String(i)}
          renderItem={({item}: {item: Medication}) => (
            <MedicationItem
              item={item}
              onPress={(medication: Medication) => {
                setAddOrEditMedicationId(medication);
              }}
            />
          )}
          ItemSeparatorComponent={() => ItemSeparator(theme)}
          style={styles.wide}
        />
        {addOrEditMedicationId === undefined && (
          <FAB
            style={styles.fab}
            small
            icon={() => <MaterialCommunityIcons name="plus" size={24} />}
            onPress={() => setAddOrEditMedicationId(emptyMedication)}
          />
        )}
        <Portal>
          <Modal visible={addOrEditMedicationId !== undefined}>
            <NewMedication
              value={addOrEditMedicationId}
              medications={medications}
              theme={theme}
              saveNewMedication={(medication?: Medication) => {
                if (medication) {
                  saveMedication(medication).then(
                    (m: Medication | undefined) => {
                      if (m && m.key) {
                        setAddOrEditMedicationId(undefined);
                        //setNewMedications([...newMedications, c.key]);
                        //onValueChange(newMedications);
                      }
                    },
                  );
                } else {
                  setAddOrEditMedicationId(undefined);
                }
              }}
            />
          </Modal>
        </Portal>
      </View>
    );
  }
};

export const Medications = () => {
  const navigation = useNavigation();
  useFocusEffect(() => {
    navigation.dangerouslyGetParent()?.setOptions({headerTitle: 'Medications'});
  });
  return (
    <View style={styles.outerContainer}>
      <React.Suspense fallback={<ActivityIndicator />}>
        <MedicationsList />
      </React.Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  rowWide: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    flex: 1,
  },
  outerContainer: {
    height: '100%',
  },
  wide: {
    width: '100%',
  },
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: '100%',
  },
  existingMedication: {
    flex: 1,
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
    flex: 1,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  number: {
    fontSize: 12,
    opacity: 0.5,
  },
  icon: {
    marginHorizontal: 8,
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

export default Medications;
