import * as React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Platform,
  Alert,
  GestureResponderEvent,
} from 'react-native';
import {Text, Modal, Portal, FAB, ActivityIndicator} from 'react-native-paper';
import {
  useScrollToTop,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  addContact,
  getContacts,
  emptyContact,
  deleteContact,
} from '../../middleware/ContactsMiddleware';
import {ThemeState} from '../../reducers/ThemeReducer';
import {Contact, ContactsType} from '../../reducers/ContactsReducer';
import {NewContact} from '../shared/Contacts';
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
import {State} from '../../Types';

const ContactItem = React.memo(
  ({item, onPress}: {item: Contact; onPress: (contact: Contact) => void}) => {
    const [user, theme] = useSelector((state: State) => [
      state.user,
      state.theme,
    ]);
    const {colors} = theme.navigation;
    const cache = useQueryCache();
    const [mutateDelete] = useMutation(
      (contact: Contact) => deleteContact(user, contact),
      {
        onSuccess: (d, v) => {
          queryCache.setQueryData(
            'users/contacts',
            (old: ContactsType | undefined) => {
              if (old !== undefined) {
                const keyToRemove = v.key;
                const {[keyToRemove]: removed, ...rest} = old;
                return rest as ContactsType;
              } else {
                return {};
              }
            },
          );
        },
        onSettled: () => cache.invalidateQueries('users/contacts'),
      },
    );
    const createTwoButtonAlert = (e: GestureResponderEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (Platform.OS === 'web') {
        // Alert doesn't seem to work in expo/web https://github.com/expo/expo/issues/6560
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
      <View
        style={[
          styles.flexRow,
          {backgroundColor: theme.navigation.colors.card},
        ]}>
        <TouchableHighlight
          onPress={() => onPress(item)}
          containerStyle={styles.existingContact}>
          <View style={styles.item}>
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
                {item.number}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
        <MaterialCommunityIcons
          style={styles.deleteIcon}
          name={'delete'}
          onPress={createTwoButtonAlert}
          color={theme.paper.colors.text}
          size={26}
        />
      </View>
    );
  },
);

const ItemSeparator = (theme: ThemeState['theme']) => {
  const {colors} = theme.navigation;
  return <View style={[styles.separator, {backgroundColor: colors.border}]} />;
};

export const ContactsList = () => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  let dummyForType: Contact | undefined;
  const [addOrEditContact, setAddOrEditContact] = React.useState(dummyForType);
  const cache = useQueryCache();
  const fetchDataTypes = (path: string) => getContacts(user);
  const {data, status, error} = useQuery<
    ContactsType,
    Error,
    [string, number | undefined]
  >('users/contacts', fetchDataTypes, {suspense: true});
  const [saveContact] = useMutation((c: Contact) => addContact(user, c), {
    onSuccess: (c) => {
      queryCache.setQueryData<ContactsType>('users/contacts', (old) => {
        const newContactType: ContactsType = {};
        if (c.key) {
          newContactType[c.key] = c;
        }
        if (old) {
          return {...old, ...newContactType};
        } else {
          return newContactType;
        }
      });
    },
    onSettled: () => cache.invalidateQueries('users/contacts'),
  });
  const contacts = data || {};
  const ref = React.useRef<FlatList<Contact>>(null);
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
          data={firebaseDocumentToArray<Contact>(contacts)}
          keyExtractor={(_, i) => String(i)}
          renderItem={({item}: {item: Contact}) => (
            <ContactItem
              item={item}
              onPress={(contact: Contact) => {
                setAddOrEditContact(contact);
              }}
            />
          )}
          ItemSeparatorComponent={() => ItemSeparator(theme)}
          style={styles.wide}
        />
        {addOrEditContact === undefined && (
          <FAB
            style={styles.fab}
            small
            icon={() => <MaterialCommunityIcons name="plus" size={24} />}
            onPress={() => setAddOrEditContact(emptyContact)}
          />
        )}
        <Portal>
          <Modal visible={addOrEditContact !== undefined}>
            <NewContact
              value={addOrEditContact}
              saveNewContact={(contact?: Contact) => {
                if (contact) {
                  saveContact(contact).then((c: Contact | undefined) => {
                    if (c && c.key) {
                      setAddOrEditContact(undefined);
                      //setNewContacts([...newContacts, c.key]);
                      //onValueChange(newContacts);
                    }
                  });
                } else {
                  setAddOrEditContact(undefined);
                }
              }}
            />
          </Modal>
        </Portal>
      </View>
    );
  }
};

export const Contacts = () => {
  const navigation = useNavigation();
  useFocusEffect(() => {
    navigation.dangerouslyGetParent()?.setOptions({headerTitle: 'Contacts'});
  });
  return (
    <View style={styles.outerComponent}>
      <React.Suspense fallback={<ActivityIndicator />}>
        <ContactsList />
      </React.Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  flexRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  wide: {
    width: '100%',
  },
  outerComponent: {
    height: '100%',
  },
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: '100%',
  },
  existingContact: {
    flex: 1,
    display: 'flex',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    flex: 1,
    width: 'auto',
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#e91e63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    marginHorizontal: 8,
  },
  letter: {
    color: 'white',
    fontWeight: 'bold',
  },
  details: {
    margin: 8,
    width: '100%',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  number: {
    fontSize: 12,
    opacity: 0.5,
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

export default Contacts;
