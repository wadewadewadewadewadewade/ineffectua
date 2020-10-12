import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import { Text, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { connect, useSelector, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addContact, emptyContact, newContactName } from '../../middleware/ContactsMiddleware';
import { State } from '../../Types';
import { ThemeState, paperColors } from '../../reducers/ThemeReducer';
import { Contact, ContactsState } from '../../reducers/ContactsReducer';
import { TouchableOpacity, FlatList } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { firebaseDocumentToArray } from '../../firebase/utilities';
import FlexableTextArea from './FlexableTextArea';

export const NewContact = (props: {
  value?: Contact
  saveNewContact: (contact?: Contact) => void
}) => {
  const [theme, contacts] = useSelector((state: State) => [state.theme, state.contacts])
  const { value, saveNewContact } = props;
  const [name, setName] = React.useState(value?.name || '');
  const [nameTouched, setNameTouched] = React.useState(false);
  const [number, setNumber] = React.useState(value?.number || '');
  const [email, setEmail] = React.useState(value?.email || '');
  const [location, setLocation] = React.useState(value?.location || '');
  const [description, setDescription] = React.useState(value?.description || '');
  const newContact: Contact = {
    name,
    number,
    email,
    location,
    description
  };
  const buttonLabel = !value || value === emptyContact ? 'Add New' : 'Edit';
  const contactsArray = firebaseDocumentToArray<Contact>(contacts);
  const nameExists = contactsArray.filter(c => c.name === name);
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
      <TextInput
        value={number}
        keyboardType="phone-pad"
        onChangeText={(text) => setNumber(text)}
        placeholder="Optional Phone Number" />
      <TextInput
        autoCapitalize="none"
        value={email}
        keyboardType="email-address"
        onChangeText={(text) => setEmail(text)}
        placeholder="Optional Email" />
      <TextInput
        value={location}
        onChangeText={(text) => setLocation(text)}
        placeholder="Optional address or location" />
      <FlexableTextArea
        value={description}
        onChangeText={(text) => setDescription(text)} />
      <TouchableOpacity
        style={{backgroundColor: theme.paper.colors.accent, ...styles.button}}
        onPress={() => {
          typeof name === 'string' && name.length && nameExists.length === 0 && saveNewContact(newContact)
        }}>
        <Text style={styles.buttonContents}>{buttonLabel} Contact</Text>
      </TouchableOpacity>
      <Button onPress={() => saveNewContact()} style={{paddingVertical:8}}><Text>Cancel</Text></Button>
    </SafeAreaView>
  )
}

const ContactItem = ({
  contact
} : {
  contact: Contact
}) => {
  return (
    <View style={styles.contactItem}>
      <Text style={styles.contactItemName}>{contact.name}</Text>
    </View>
  )
}

type Props = {
  value?: Array<string>,
  display?: 'list',
  limit?: number,
  onValueChange?: (contacts: Array<string>) => void,
};

const Contacts = ({
  value,
  display,
  limit,
  onValueChange,
}: Props) => {
  const [theme, contacts] = useSelector((state: State) => [state.theme, state.contacts])
  const dispatch = useDispatch()
  const addNewContact = (contact: Contact, onComplete: (contact: Contact) => void) =>
    dispatch(addContact(contact, onComplete))
  const [visible, setVisible] = React.useState(false);
  const [newContacts, setNewContacts] = React.useState(value || new Array<string>());
  const contactsArray = firebaseDocumentToArray<Contact>(contacts, {name:newContactName});
  let pickerRef: RNPickerSelect | null = null;
  if (display === 'list') {
    return (
      <View style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
        <Text style={{color: theme.paper.colors.text}}>Contacts</Text>
        <SafeAreaView style={{paddingLeft:12}}>
          <FlatList
            data={contactsArray}
            keyExtractor={i => i.key || i.name}
            renderItem={({item, index}) => (<ContactItem contact={item} />)}
          />
        </SafeAreaView>
      </View>
    )
  } else if (limit === 1) {
    return (
      <View style={styles.pickerView}>
      <RNPickerSelect
        ref={(r) => pickerRef = r}
        style={pickerStyles}
        items={contactsArray.map(c => ({label:c.name,value:c.name}))}
        onValueChange={(itemValue, itemIndex) => {
          if (itemValue) {
            const sel = contactsArray.filter(c => c.name === itemValue.toString())[0];
            if (sel.name === newContactName) {
              setVisible(true);
            } else if (sel.key) {
              setNewContacts([...newContacts, sel.key]);
              if (pickerRef) {
                pickerRef.setState({value:undefined})
                pickerRef.forceUpdate()
              }
              onValueChange && onValueChange([...newContacts, sel.key]);
            }
          }
        }}
        />
      </View>
    )
  } else {
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
        <Text style={{color: theme.paper.colors.text}}>Contact</Text>
        {newContacts && newContacts.map((cId: string) => contacts[cId] && 
          <View style={styles.existingContacts}>
            <Text style={styles.existingContactsText}>{contacts[cId].name}</Text>
            <MaterialCommunityIcons onPress={() => {
              setNewContacts(newContacts.filter(c => c !== cId))
            }} style={styles.existingContactsIcon} name="delete" color={paperColors(theme).text} size={26} />
          </View>)}
        <View style={styles.pickerView}>
          <RNPickerSelect
            ref={(r) => pickerRef = r}
            style={pickerStyles}
            items={contactsArray.map(c => ({label:c.name,value:c.name}))}
            onValueChange={(itemValue, itemIndex) => {
              if (itemValue) {
                const sel = contactsArray.filter(c => c.name === itemValue.toString())[0];
                if (sel.name === newContactName) {
                  setVisible(true);
                } else if (sel.key) {
                  setNewContacts([...newContacts, sel.key]);
                  if (pickerRef) {
                    pickerRef.setState({value:undefined})
                    pickerRef.forceUpdate()
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
              saveNewContact={(contact?: Contact)=> {
                if (contact) {
                  addNewContact(contact, (c: Contact) => {
                    if (c.key) {
                      setVisible(false);
                      setNewContacts([...newContacts, c.key]);
                      onValueChange && onValueChange(newContacts);
                    }
                  })
                } else {
                  setVisible(false)
                }
              }} />
          </Modal>
        </Portal>
      </View>
    )
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
  existingContacts: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal:8,
    fontSize: 20,
    justifyContent:'flex-end',
    marginLeft:'20%'
  },
  existingContactsText: {
    flex:1,
    fontSize: 16,
    width:'90%',
    alignSelf:'flex-start',
    paddingVertical: 8,
  },
  existingContactsIcon: {
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
  contactItem: {
    flex: 1,
    flexDirection: 'row',
  },
  contactItemName: {
    fontSize: 12,
  },
});

export default Contacts;