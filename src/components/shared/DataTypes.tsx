import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import {Picker} from '@react-native-community/picker';
import { Text, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addDataType, dataTypeIsValid, newTypeTitle, defaultTypeTitle, emptyDataType, datatypesToArray } from '../../middleware/DataTypesMiddleware';
import { DataType, State } from '../../Types';
import { ThemeState } from '../../reducers/ThemeReducer';
import { DataTypesState } from '../../reducers/DataTypesReducer';
import { ColorPicker } from 'react-native-color-picker';
import { TouchableOpacity } from 'react-native-gesture-handler';

type Props = {
  value?: DataType;
  onValueChange: (datatype: DataType) => void;
  theme: ThemeState['theme'],
  datatypes: DataTypesState['datatypes'],
  addDataTypes: (datatype: DataType, onComplete: (datatype: DataType) => void) => void
};

const DataTypes = ({
  value,
  onValueChange,
  theme,
  datatypes,
  addDataTypes
}: Props) => {
  const [newDataType, setNewDataType] = React.useState(emptyDataType);
  const [visible, setVisible] = React.useState(false);
  const [selected, setSelected] = React.useState(value?.title || '');
  const newDataTypeIsValid = dataTypeIsValid(newDataType, datatypes)
  const datatypesArray = datatypesToArray(datatypes);
  //<Button onPress={() => setVisible(true)}><Text>testing</Text></Button>
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
      <Text style={{color: theme.paper.colors.text}}>Type</Text>
      <Picker
        accessibilityLabel='Type of data'
        selectedValue={selected}
        onValueChange={(itemValue, itemIndex) => {
          const sel = datatypesArray.filter(dt => dt.title === itemValue.toString())[0];
          if (sel.title === newTypeTitle) {
            setVisible(true)
          } else if (sel.title !== defaultTypeTitle) {
            setSelected(sel.title);
            onValueChange(sel);
          }
        }}
        >
          {datatypesArray.map(dt => <Picker.Item label={dt.title} value={dt.title} />)}
      </Picker>
      <Portal>
        <Modal visible={visible}>
          <View style={{backgroundColor: theme.paper.colors.surface, height:'90%'}}>
            <TextInput
              value={newDataType.title}
              onChangeText={(text) => {
                const datatype: DataType = {...newDataType, title: text}
                setNewDataType(datatype)
              }}
              placeholder="Add title of data type" />
            <ColorPicker
              hideSliders={true}
              onColorSelected={color => {
                const datatype: DataType = {...newDataType, color: color}
                setNewDataType(datatype)
              }}
              style={{flex: 1}}
            />
            <TouchableOpacity
              disabled={!newDataTypeIsValid}
              style={{backgroundColor: newDataTypeIsValid ? theme.paper.colors.accent : theme.paper.colors.disabled, ...styles.button}}
              onPress={() => addDataTypes(newDataType, (datatype) => {
              setNewDataType(emptyDataType);
              setVisible(false);
              onValueChange(datatype);
            })}>
              <Text>SAVE</Text>
            </TouchableOpacity>
            <Button onPress={() => {
              setNewDataType(emptyDataType);
              setVisible(false)}
            }><Text>cancel</Text></Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttons: {
    padding: 8,
  },
  button: {
    padding: 8,
    alignItems: 'center',
  },
});

interface OwnProps {
}

interface DispatchProps {
  addDataTypes: (datatype: DataType, onComplete: (datatype: DataType) => void) => void
}

const mapStateToProps = (state: State) => {
  return {
    user: state.user,
    theme: state.theme,
    datatypes: state.datatypes
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, {}, any>, ownProps: OwnProps): DispatchProps => {
  return {
    addDataTypes: (datatype: DataType, onComplete: (datatype: DataType) => void) => {
      dispatch(addDataType(datatype, onComplete))
    }
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(DataTypes);