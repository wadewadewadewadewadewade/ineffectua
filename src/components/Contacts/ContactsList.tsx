import * as React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Modal, Portal, FAB } from 'react-native-paper';
import { useScrollToTop } from '@react-navigation/native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { State } from '../../Types';
import { addContact, emptyContact } from '../../middleware/ContactsMiddleware';
import { ThemeState } from '../../reducers/ThemeReducer';
import { ContactsState, Contact } from '../../reducers/ContactsReducer';
import { NewContact } from '../shared/Contacts'
import { TouchableHighlight } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { firebaseDocumentToArray } from '../../middleware';

const ContactItem = React.memo((
  { item, theme, onPress }:
  { item: Contact, theme: ThemeState['theme'], onPress: (contact: Contact) => void }
) => {
    const { colors } = theme.navigation;

    return (
      <TouchableHighlight onPress={() => onPress(item)} style={styles.existingContact}>
        <View style={[styles.item, { backgroundColor: colors.card }]}>
          <View style={styles.avatar}>
            <Text style={styles.letter}>
              {item.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.number, { color: colors.text, opacity: 0.5 }]}>
              {item.number}
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
  contacts: ContactsState['contacts'],
  addNewContact: (contact: Contact, onComplete: (contact: Contact) => void) => void
}

export const ContactsList = ({
  theme,
  contacts,
  addNewContact
}: Props) => {
  let dummyForType: Contact | undefined;
  const [addOrEditContactId, setAddOrEditContactId] = React.useState(dummyForType);

  const ref = React.useRef<FlatList<Contact>>(null);

  useScrollToTop(ref);

  const renderItem = ({ item }: { item: Contact }) => <ContactItem
    item={item}
    theme={theme}
    onPress={(contact: Contact) => {
      setAddOrEditContactId(contact)
    }} />;

  return (
    <View
      style={styles.container}
    >
      <FlatList
        ref={ref}
        data={firebaseDocumentToArray<Contact>(contacts)}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => ItemSeparator(theme)}
      />
      {addOrEditContactId === undefined && <FAB
        style={styles.fab}
        small
        icon={() => <MaterialCommunityIcons name="plus" size={24} />}
        onPress={() => setAddOrEditContactId(emptyContact)}
      />}
      <Portal>
        <Modal visible={addOrEditContactId !== undefined}>
          <NewContact
            value={addOrEditContactId}
            contacts={contacts}
            theme={theme}
            saveNewContact={(contact?: Contact)=> {
              if (contact) {
                addNewContact(contact, (c: Contact) => {
                  if (c.key) {
                    setAddOrEditContactId(undefined);
                    //setNewContacts([...newContacts, c.key]);
                    //onValueChange(newContacts);
                  }
                })
              } else {
                setAddOrEditContactId(undefined);
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
  existingContact: {
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
};
export default connect(mapStateToProps, mapDispatchToProps)(ContactsList);