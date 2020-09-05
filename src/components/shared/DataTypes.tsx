import * as React from 'react';
import { View, StyleSheet, TextInput as TextInputType } from 'react-native';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import { Text, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addDataType, dataTypeIsValid, newTypeTitle, defaultTypeTitle, emptyDataType, datatypesToArray } from '../../middleware/DataTypesMiddleware';
import { DataType, State } from '../../Types';
import { ThemeState } from '../../reducers/ThemeReducer';
import { DataTypesState } from '../../reducers/DataTypesReducer';
import { ColorPicker, fromHsv } from 'react-native-color-picker';
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
  const [newTitle, setNewTitle] = React.useState(value?.title ||'');
  const [newColor, setNewColor] = React.useState(value?.color || '');
  const [visible, setVisible] = React.useState(false);
  const newDataType = {title:newTitle,color:newColor};
  const newDataTypeIsValid = dataTypeIsValid(newDataType, datatypes);
  const [selected, setSelected] = React.useState(value?.title || defaultTypeTitle);
  const datatypesArray = datatypesToArray(datatypes);
  let newDatatypeRef: TextInputType | null = null;
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
      <View style={{flex:1,marginLeft:20}}>
        <RNPickerSelect
          style={pickerStyles}
          items={datatypesArray.map(dt => ({label:dt.title,value:dt.title}))}
          value={selected}
          onValueChange={(itemValue, itemIndex) => {
            const sel = datatypesArray.filter(dt => dt.title === itemValue.toString())[0];
            if (sel.title === newTypeTitle) {
              setVisible(true);
              newDatatypeRef?.focus();
            } else if (sel.title !== defaultTypeTitle) {
              setSelected(sel.title);
              onValueChange(sel);
            }
          }}
          />
      </View>
      <Portal>
        <Modal visible={visible}>
          <View style={{backgroundColor: theme.paper.colors.surface, height:'90%'}}>
            <TextInput
              ref={(input) => { newDatatypeRef = input; }}
              value={newTitle}
              onChangeText={(text) => setNewTitle(text)}
              placeholder="Add title of data type" />
            <ColorPicker
              //color={newColor}
              hideSliders={true}
              onColorChange={color => setNewColor(fromHsv(color))}
              style={{flex: 1}}
            />
            <TouchableOpacity
              disabled={!newDataTypeIsValid}
              style={{backgroundColor: newDataTypeIsValid ? theme.paper.colors.accent : theme.paper.colors.disabled, ...styles.button}}
              onPress={() => addDataTypes(newDataType, (datatype) => {
              setVisible(false);
              onValueChange(datatype);
            })}>
              <Text>SAVE</Text>
            </TouchableOpacity>
            <Button onPress={() => {
              setNewTitle(value?.title || '');
              setNewColor(value?.color || '');
              setVisible(false)}
            }><Text>cancel</Text></Button>
          </View>
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
  select: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#AAA',
  },
  buttons: {
    paddingHorizontal: 8,
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