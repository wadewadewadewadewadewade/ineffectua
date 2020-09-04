import * as React from 'react';
import { View } from 'react-native';
import {Picker} from '@react-native-community/picker';
import { Text, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addDataType } from '../../middleware/DataTypesMiddleware';
import { DataType, State } from '../../Types';
import { ThemeState } from '../../reducers/ThemeReducer';
import { DataTypesState } from '../../reducers/DataTypesReducer';
import { AuthState } from '../../reducers/AuthReducer';
import { ColorPicker } from 'react-native-color-picker';

type Props = {
  value?: DataType;
  onValueChange: (datatype: DataType) => void;
  user: AuthState['user'],
  theme: ThemeState['theme'],
  datatypes: DataTypesState['datatypes'],
  addDataTypes: (datatype: DataType, onComplete: (datatype: DataType) => void) => void
};

const DataTypes = ({
  value,
  onValueChange,
  user,
  theme,
  datatypes,
  addDataTypes
}: Props) => {
  const newTypeTitle = '+ Add New Type';
  const emptyDataType = {title:'',color:'#000'};
  const [newDataType, setNewDataType] = React.useState(emptyDataType);
  const [visible, setVisible] = React.useState(false);
  const [selected, setSelected] = React.useState(value?.title || '');
  const datatypesArray = React.useMemo(() => {
    const arr = new Array<DataType>({title:'Default',color:'#600'});
    const keys = Object.keys(datatypes);
    for(let i=0;i<keys.length;i++) {
      const dt = datatypes[keys[i]];
      dt.key = keys[i]
      arr.push(dt);
    }
    arr.push({title:newTypeTitle,color:''})
    return arr;
  }, [datatypes])
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
        selectedValue={selected}
        onValueChange={(itemValue, itemIndex) => {
          const sel = datatypesArray.filter(dt => dt.title === itemValue.toString())[0];
          if (sel.title === newTypeTitle) {
            setVisible(true)
          } else {
            setSelected(sel.title);
            onValueChange(sel);
          }
        }}
        >
          {datatypesArray.map(dt => <Picker.Item label={dt.title} value={dt.title} />)}
      </Picker>
      <Portal>
        <Modal visible={visible}>
          <View style={{backgroundColor: theme.paper.colors.surface}}>
            <TextInput
              value={newDataType.title}
              onChangeText={(text) => setNewDataType({...newDataType, title: text})}
              placeholder="Add title" />
            <ColorPicker
              onColorSelected={color => setNewDataType({...newDataType, color: color})}
              style={{flex: 1}}
            />
            <Button onPress={() => addDataTypes(newDataType, (datatype) => {
              setNewDataType(emptyDataType);
              setVisible(false);
              onValueChange(datatype);
            })}>
              <Text>SAVE</Text>
            </Button>
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