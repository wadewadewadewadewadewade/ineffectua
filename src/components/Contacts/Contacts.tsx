import * as React from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {Text, Modal, Portal, FAB, ActivityIndicator} from 'react-native-paper';
import {useScrollToTop} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {addContact, getContacts, emptyContact} from '../../middleware/ContactsMiddleware';
import {ThemeState} from '../../reducers/ThemeReducer';
import {Contact, ContactsType} from '../../reducers/ContactsReducer';
import {NewContact} from '../shared/Contacts';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {firebaseDocumentToArray} from '../../firebase/utilities';
import { useQueryCache, useQuery, useMutation, queryCache, QueryStatus } from 'react-query';
import { State } from '../../Types';

const ContactItem = React.memo(
  ({
    item,
    theme,
    onPress,
  }: {
    item: Contact;
    theme: ThemeState['theme'];
    onPress: (contact: Contact) => void;
  }) => {
    const {colors} = theme.navigation;

    return (
      <TouchableHighlight
        onPress={() => onPress(item)}
        style={styles.existingContact}>
        <View style={[styles.item, {backgroundColor: colors.card}]}>
          <View style={styles.avatar}>
            <Text style={styles.letter}>
              {item.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.name, {color: colors.text}]}>{item.name}</Text>
            <Text style={[styles.number, {color: colors.text}]}>
              {item.number}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  },
);

const ItemSeparator = (theme: ThemeState['theme']) => {
  const {colors} = theme.navigation;

  return <View style={[styles.separator, {backgroundColor: colors.border}]} />;
};

export const ContactsList = () => {
  const [user, theme] = useSelector((state: State) => [state.user, state.theme]);
  let dummyForType: Contact | undefined;
  const [addOrEditContactId, setAddOrEditContactId] = React.useState(
    dummyForType,
  );
  const cache = useQueryCache();
  const fetchDataTypes = (path: string) => getContacts(user);
  const {
    data,
    status,
    error,
  } = useQuery<
    ContactsType,
    Error,
    [string, number | undefined]
  >('users/contacts', fetchDataTypes, {suspense: true});
  const [saveContact] = useMutation((m: Contact) => addContact(user, m), {
    onSuccess: (m) => {
      queryCache.setQueryData<ContactsType>('users/contacts', (old) => {
        const newMedciationType: ContactsType = {};
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
    onSettled: () => cache.invalidateQueries('users/datatypes'),
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
              theme={theme}
              onPress={(contact: Contact) => {
                setAddOrEditContactId(contact);
              }}
            />
          )}
          ItemSeparatorComponent={() => ItemSeparator(theme)}
          style={styles.wide}
        />
        {addOrEditContactId === undefined && (
          <FAB
            style={styles.fab}
            small
            icon={() => <MaterialCommunityIcons name="plus" size={24} />}
            onPress={() => setAddOrEditContactId(emptyContact)}
          />
        )}
        <Portal>
          <Modal visible={addOrEditContactId !== undefined}>
            <NewContact
              value={addOrEditContactId}
              saveNewContact={(contact?: Contact) => {
                if (contact) {
                  saveContact(contact).then((c: Contact | undefined) => {
                    if (c && c.key) {
                      setAddOrEditContactId(undefined);
                      //setNewContacts([...newContacts, c.key]);
                      //onValueChange(newContacts);
                    }
                  });
                } else {
                  setAddOrEditContactId(undefined);
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
  return (
    <View>
      <React.Suspense fallback={<ActivityIndicator />}>
        <ContactsList />
      </React.Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
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
  existingContact: {
    display: 'flex',
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
