import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import { Text, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addContact, emptyContact, ContactsToArray, newContactName } from '../../middleware/ContactsMiddleware';
import { Contact, State } from '../../Types';
import { ThemeState } from '../../reducers/ThemeReducer';
import { ContactsState } from '../../reducers/ContactsReducer';
import { TouchableOpacity } from 'react-native-gesture-handler';

const NewContact = (props: {
  value?: Contact
  contacts: ContactsState['contacts'],
  theme: ThemeState['theme'],
  saveNewContact: (contact?: Contact) => void
}) => {
  const { value, contacts, theme, saveNewContact } = props;
  const [name, setName] = React.useState(value?.name || '');
  const [number, setNumber] = React.useState(value?.number || '');
  const [email, setEmail] = React.useState(value?.email || '');
  const [location, setLocation] = React.useState(value?.location || '');
  const [description, setDescription] = React.useState(value?.description || '');
  const newContact = emptyContact;
  const ContactsArray = ContactsToArray(contacts);
  const nameExists = ContactsArray.filter(c => c.name === name);
  const [descriptionHeight, setDescriptionHeight] = React.useState(1);
  return (
    <View style={{backgroundColor: theme.paper.colors.surface, height:'90%'}}>
      <TextInput
        ref={(input) => {
          input?.focus();
        }}
        value={name}
        onChangeText={(text) => setName(text)}
        placeholder="Name" />
      <TextInput
        value={number}
        keyboardType="phone-pad"
        onChangeText={(text) => setNumber(text)}
        placeholder="Optional Phone Number" />
      <TextInput
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
    </View>
  )
}

type Props = {
  value?: Contact;
  onValueChange: (Contact: Contact) => void;
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
  const [selected, setSelected] = React.useState(value?.name);
  const contactsArray = ContactsToArray(contacts);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Text style={{color: theme.paper.colors.text}}>Contact</Text>
      <View style={{flex:1,marginLeft:20}}>
        <RNPickerSelect
          style={pickerStyles}
          items={contactsArray.map(c => ({label:c.name,value:c.name}))}
          value={selected}
          onValueChange={(itemValue, itemIndex) => {
            const sel = contactsArray.filter(c => c.name === itemValue.toString())[0];
            if (sel.name === newContactName) {
              setVisible(true);
            } else {
              setSelected(sel.name);
              onValueChange(sel);
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
                  setVisible(false);
                  onValueChange(c);
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
    padding:3
  },
  button: {
    padding: 16,
    alignItems: 'center',
    paddingVertical: 16
  },
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
    addNewContact: (contact: Contact, onComplete: (Contact: Contact) => void) => {
      dispatch(addContact(contact, onComplete))
    }
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Contacts);