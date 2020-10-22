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
} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {
  addContact,
  emptyContact,
  newContactName,
  getContacts,
} from '../../middleware/ContactsMiddleware';
import {State} from '../../Types';
import {paperColors, Theme} from '../../reducers/ThemeReducer';
import {Contact, ContactsType} from '../../reducers/ContactsReducer';
import {
  TouchableOpacity,
  FlatList,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {firebaseDocumentToArray} from '../../firebase/utilities';
import FlexableTextArea from './FlexableTextArea';
import {
  useQueryCache,
  useMutation,
  QueryStatus,
  useQuery,
  queryCache,
} from 'react-query';
import DataTypes from './DataTypes';
import {navigate} from '../RootNavigation';

export const NewContact = (props: {
  value?: Contact;
  saveNewContact: (contact?: Contact) => void;
}) => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const {value, saveNewContact} = props;
  const [name, setName] = React.useState(value?.name || '');
  const [typeId, setTypeId] = React.useState(value?.typeId);
  const [nameTouched, setNameTouched] = React.useState(false);
  const [number, setNumber] = React.useState(value?.number);
  const [email, setEmail] = React.useState(value?.email);
  const [location, setLocation] = React.useState(value?.location);
  const [description, setDescription] = React.useState(
    value?.description || '',
  );
  const newContact: Contact = {
    key: value?.key || '',
    created: new Date(),
    name,
    typeId,
    number,
    email,
    location,
    description,
  };
  const buttonLabel = !value || value === emptyContact ? 'Add New' : 'Edit';
  const {data} = useQuery<ContactsType, Error, [string]>(
    '/users/contacts',
    () => getContacts(user),
    {suspense: false},
  );
  const contactsArray = (data && firebaseDocumentToArray(data)) || [];
  const nameExists = contactsArray.filter((c) => c.name === name);
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
      <DataTypes value={typeId} onValueChange={(dt) => setTypeId(dt.key)} />
      <TextInput
        value={number}
        keyboardType="phone-pad"
        onChangeText={(text) => setNumber(text)}
        placeholder="Optional Phone Number"
      />
      <TextInput
        autoCapitalize="none"
        value={email}
        keyboardType="email-address"
        onChangeText={(text) => setEmail(text)}
        placeholder="Optional Email"
      />
      <TextInput
        value={location}
        onChangeText={(text) => setLocation(text)}
        placeholder="Optional address or location"
      />
      <FlexableTextArea
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <TouchableOpacity
        style={{backgroundColor: theme.paper.colors.accent, ...styles.button}}
        onPress={() => {
          typeof name === 'string' &&
            name.length &&
            nameExists.length === 0 &&
            saveNewContact(newContact);
        }}>
        <Text style={styles.buttonContents}>{buttonLabel} Contact</Text>
      </TouchableOpacity>
      <Button onPress={() => saveNewContact()} style={styles.saveButton}>
        <Text>Cancel</Text>
      </Button>
    </SafeAreaView>
  );
};

const ContactItem = ({contact}: {contact: Contact}) => {
  return (
    <View style={styles.contactItem}>
      <Text style={styles.contactItemName}>{contact.name}</Text>
    </View>
  );
};

const SideBar = ({contacts, theme}: {contacts: ContactsType; theme: Theme}) => {
  const contactsArray = firebaseDocumentToArray<Contact>(contacts);
  return (
    <View style={styles.container}>
      <TouchableHighlight
        onPress={() => {
          navigate('Contacts');
        }}>
        <View style={styles.row}>
          <Text style={[styles.labelFont, {color: theme.paper.colors.text}]}>
            Contacts
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
          data={contactsArray}
          keyExtractor={(i) => i.key}
          renderItem={({item, index}) => <ContactItem contact={item} />}
        />
      </SafeAreaView>
    </View>
  );
};

type Props = {
  value?: Array<string>;
  display?: 'list' | 'page' | 'summary';
  limit?: number;
  userId?: string;
  onValueChange?: (contacts: Array<string>) => void;
};

const ContactsComponent = ({
  value,
  display,
  limit,
  userId,
  onValueChange,
}: Props) => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
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
        const newContactsType: ContactsType = {};
        if (c.key) {
          newContactsType[c.key] = c;
        }
        if (old) {
          return {...old, ...newContactsType};
        } else {
          return newContactsType;
        }
      });
    },
    onSettled: () => cache.invalidateQueries('users/contacts'),
  });
  const contacts = data || {};
  const [visible, setVisible] = React.useState(false);
  const [newContacts, setNewContacts] = React.useState(
    value || new Array<string>(),
  );
  const contactsArray = firebaseDocumentToArray<Contact>(
    contacts,
    userId ? undefined : {key: '', name: newContactName, created: new Date(-1)},
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
      return <SideBar theme={theme} contacts={contacts} />;
    } else if (display === 'summary') {
      return (
        <View style={styles.container}>
          <TouchableHighlight
            onPress={() => {
              navigate('Contacts');
            }}>
            <View style={styles.row}>
              <Text
                style={[styles.labelFont, {color: theme.paper.colors.text}]}>
                Contacts
              </Text>
              <MaterialCommunityIcons
                style={styles.navigateIcon}
                name="chevron-right"
                color={paperColors(theme).text}
                size={26}
              />
            </View>
          </TouchableHighlight>
          {contactsArray.map((c) => (
            <ContactItem key={c.key} contact={c} />
          ))}
        </View>
      );
    } else if (limit === 1) {
      return (
        <View style={styles.pickerView}>
          <RNPickerSelect
            ref={(r) => (pickerRef = r)}
            style={pickerStyles}
            items={contactsArray.map((c) => ({label: c.name, value: c.name}))}
            onValueChange={(itemValue, itemIndex) => {
              if (itemValue) {
                const sel = contactsArray.filter(
                  (c) => c.name === itemValue.toString(),
                )[0];
                if (sel.name === newContactName) {
                  setVisible(true);
                } else if (sel.key) {
                  setNewContacts([...newContacts, sel.key]);
                  if (pickerRef) {
                    pickerRef.setState({value: undefined});
                    pickerRef.forceUpdate();
                  }
                  onValueChange && onValueChange([...newContacts, sel.key]);
                }
              }
            }}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text style={{color: theme.paper.colors.text}}>Contact</Text>
          {newContacts &&
            newContacts.map(
              (cId: string) =>
                contacts[cId] && (
                  <View key={cId} style={styles.existingContacts}>
                    <Text style={styles.existingContactsText}>
                      {contacts[cId].name}
                    </Text>
                    <MaterialCommunityIcons
                      onPress={() => {
                        setNewContacts(newContacts.filter((c) => c !== cId));
                      }}
                      style={styles.existingContactsIcon}
                      name="delete"
                      color={paperColors(theme).text}
                      size={26}
                    />
                  </View>
                ),
            )}
          <View style={styles.pickerView}>
            <RNPickerSelect
              ref={(r) => (pickerRef = r)}
              style={pickerStyles}
              items={contactsArray.map((c) => ({label: c.name, value: c.name}))}
              onValueChange={(itemValue, itemIndex) => {
                if (itemValue) {
                  const sel = contactsArray.filter(
                    (c) => c.name === itemValue.toString(),
                  )[0];
                  if (sel.name === newContactName) {
                    setVisible(true);
                  } else if (sel.key) {
                    setNewContacts([...newContacts, sel.key]);
                    if (pickerRef) {
                      pickerRef.setState({value: undefined});
                      pickerRef.forceUpdate();
                    }
                    onValueChange && onValueChange([...newContacts, sel.key]);
                  }
                }
              }}
            />
          </View>
          <Portal>
            <Modal visible={visible}>
              <NewContact
                value={emptyContact}
                saveNewContact={(contact?: Contact) => {
                  if (contact) {
                    saveContact(contact).then((c: Contact | undefined) => {
                      if (c && c.key) {
                        setVisible(false);
                        setNewContacts([...newContacts, c.key]);
                        onValueChange && onValueChange(newContacts);
                      }
                    });
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

export const Contacts = (props: Props) => {
  return (
    <View>
      <React.Suspense fallback={<ActivityIndicator />}>
        <ContactsComponent {...props} />
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
  navigateIcon: {
    fontSize: 16,
  },
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sidebarInset: {
    paddingLeft: 12,
  },
  button: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  saveButton: {
    paddingVertical: 8,
  },
  existingContacts: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 20,
    justifyContent: 'flex-end',
    marginLeft: '20%',
  },
  existingContactsText: {
    flex: 1,
    fontSize: 16,
    width: '90%',
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  existingContactsIcon: {
    fontSize: 20,
    width: '10%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navigatieIcon: {
    fontSize: 20,
    width: '10%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pickerView: {
    flex: 1,
    width: '80%',
    alignSelf: 'flex-end',
  },
  buttonContents: {
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    paddingVertical: 16,
  },
  contactItem: {
    flex: 1,
    flexDirection: 'row',
  },
  contactItemName: {
    fontSize: 12,
  },
});

export default Contacts;
