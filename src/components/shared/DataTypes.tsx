import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import { Text, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addDataType, newTypeTitle, defaultTypeTitle, emptyDataType, datatypesToArray } from '../../middleware/DataTypesMiddleware';
import { DataType, State } from '../../Types';
import { ThemeState } from '../../reducers/ThemeReducer';
import { DataTypesState } from '../../reducers/DataTypesReducer';
import { ColorPicker, fromHsv } from 'react-native-color-picker';
import { TouchableOpacity } from 'react-native-gesture-handler';

const NewDataType = (props: {
  value?: DataType | string
  datatypes: DataTypesState['datatypes'],
  theme: ThemeState['theme'],
  saveNewDataType: (datatype?: DataType) => void
}) => {
  const { value, datatypes, theme, saveNewDataType } = props;
  const [newTitle, setNewTitle] = React.useState(typeof value === 'string' ? datatypes[value]?.title : value?.title ||'');
  const [newColor, setNewColor] = React.useState(typeof value === 'string' ? datatypes[value]?.color : value?.color || '');
  const newDataType = {title:newTitle,color:newColor};
  const datatypesArray = datatypesToArray(datatypes);
  const newTitleExists = datatypesArray.filter(dt => dt.title === newTitle);
  return (
    <SafeAreaView style={{backgroundColor: theme.paper.colors.surface, height:'90%'}}>
      <TextInput
        ref={(input) => {
          input?.focus();
        }}
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
        style={{backgroundColor: theme.paper.colors.accent, ...styles.button}}
        onPress={() => {
          typeof newTitle === 'string' && newTitle.length && newTitleExists.length === 0 && typeof newColor === 'string' && newColor.length && saveNewDataType(newDataType)
        }}>
        <Text>SAVE</Text>
      </TouchableOpacity>
      <Button onPress={() => saveNewDataType()}><Text>cancel</Text></Button>
    </SafeAreaView>
  )
}

type Props = {
  dataTypeId?: string,
  value?: DataType | string;
  onValueChange: (datatype: DataType) => void;
  theme: ThemeState['theme'],
  datatypes: DataTypesState['datatypes'],
  addDataTypes: (datatype: DataType, onComplete: (datatype: DataType) => void) => void
};

const DataTypes = ({
  dataTypeId,
  value,
  onValueChange,
  theme,
  datatypes,
  addDataTypes
}: Props) => {
  const [visible, setVisible] = React.useState(false);
  const [selected, setSelected] = React.useState(typeof value === 'string' ? datatypes[value]?.title : value?.title || datatypes && dataTypeId && datatypes[dataTypeId] && datatypes[dataTypeId].title || defaultTypeTitle);
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
      <View style={{flex:1,marginLeft:20,maxWidth:'80%'}}>
        <RNPickerSelect
          style={pickerStyles}
          items={datatypesArray.map(dt => ({label:dt.title,value:dt.title}))}
          value={selected}
          onValueChange={(itemValue, itemIndex) => {
            const sel = datatypesArray.filter(dt => dt.title === itemValue.toString())[0];
            if (sel.title === newTypeTitle) {
              setVisible(true);
            } else if (sel.title !== defaultTypeTitle) {
              setSelected(sel.title);
              onValueChange(sel);
            }
          }}
          />
      </View>
      <Portal>
        <Modal visible={visible}>
          <NewDataType
            value={emptyDataType}
            datatypes={datatypes}
            theme={theme}
            saveNewDataType={(datatype?: DataType)=> {
              if (datatype) {
                addDataTypes(datatype, (dt) => {
                  setVisible(false);
                  onValueChange(dt);
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