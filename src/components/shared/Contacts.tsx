import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import { Text, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addContact, emptyContact, contactsToArray, newContactName } from '../../middleware/ContactsMiddleware';
import { Contact, State } from '../../Types';
import { ThemeState, paperColors } from '../../reducers/ThemeReducer';
import { ContactsState } from '../../reducers/ContactsReducer';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NewContact = (props: {
  value?: Contact
  contacts: ContactsState['contacts'],
  theme: ThemeState['theme'],
  saveNewContact: (contact?: Contact) => void
}) => {
  const { value, contacts, theme, saveNewContact } = props;
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
  const contactsArray = contactsToArray(contacts);
  const nameExists = contactsArray.filter(c => c.name === name);
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
          typeof name === 'string' && name.length && nameExists.length === 0 && saveNewContact(newContact)
        }}>
        <Text>SAVE</Text>
      </TouchableOpacity>
      <Button onPress={() => saveNewContact()}><Text>cancel</Text></Button>
    </SafeAreaView>
  )
}

type Props = {
  value?: Array<string>;
  onValueChange: (contacts: Array<string>) => void;
  theme: ThemeState['theme'],
  contacts: ContactsState['contacts'],
  addNewContact: (contact: Contact, onComplete: (contact: Contact) => void) => void
};

const Contacts = ({
  value,
  onValueChange,
  theme,
  contacts,
  addNewContact
}: Props) => {
  const [visible, setVisible] = React.useState(false);
  const [newContacts, setNewContacts] = React.useState(value || new Array<string>());
  const contactsArray = contactsToArray(contacts);
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
                onValueChange([...newContacts, sel.key]);
              }
            }
          }}
          />
      </View>
      <Portal>
        <Modal visible={visible}>
          <NewContact
            value={emptyContact}
            contacts={contacts}
            theme={theme}
            saveNewContact={(contact?: Contact)=> {
              if (contact) {
                addNewContact(contact, (c: Contact) => {
                  if (c.key) {
                    setVisible(false);
                    setNewContacts([...newContacts, c.key]);
                    onValueChange(newContacts);
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
  }
});

interface OwnProps {
}

interface DispatchProps {
  addNewContact: (Contact: Contact, onComplete: (contact: Contact) => void) => void
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
    addNewContact: (contact: Contact, onComplete: (contact: Contact) => void) => {
      dispatch(addContact(contact, onComplete))
    }
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Contacts);