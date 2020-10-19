import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import RNPickerSelect, {PickerStyle} from 'react-native-picker-select';
import {Text, Button, Modal, Portal, TextInput, ActivityIndicator} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {
  addDataType,
  newTypeTitle,
  defaultTypeTitle,
  emptyDataType,
  getDatatypes,
} from '../../middleware/DataTypesMiddleware';
import {State} from '../../Types';
import {DataType, DataTypesState, DataTypesType} from '../../reducers/DataTypesReducer';
import {ColorPicker, fromHsv} from 'react-native-color-picker';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {firebaseDocumentToArray} from '../../firebase/utilities';
import {useQueryCache, useQuery, QueryStatus, queryCache, useMutation} from 'react-query';

const NewDataType = (props: {
  value?: DataType | string;
  datatypes: DataTypesState['datatypes'];
  saveNewDataType: (datatype?: DataType) => void;
}) => {
  const theme = useSelector((state: State) => state.theme);
  const {value, datatypes, saveNewDataType} = props;
  const [newTitle, setNewTitle] = React.useState(
    typeof value === 'string' ? datatypes[value]?.title : value?.title || '',
  );
  const [newColor, setNewColor] = React.useState(
    typeof value === 'string' ? datatypes[value]?.color : value?.color || '',
  );
  const newDataType = {title: newTitle, color: newColor};
  const datatypesArray = firebaseDocumentToArray<DataType>(datatypes);
  const newTitleExists = datatypesArray.filter((dt) => dt.title === newTitle);
  return (
    <SafeAreaView style={{backgroundColor: theme.paper.colors.surface}}>
      <TextInput
        ref={(input) => {
          input?.focus();
        }}
        value={newTitle}
        onChangeText={(text) => setNewTitle(text)}
        placeholder="Add title of data type"
      />
      <ColorPicker
        //color={newColor}
        hideSliders={true}
        onColorChange={(color) => setNewColor(fromHsv(color))}
        style={styles.flex}
      />
      <TouchableOpacity
        style={{backgroundColor: theme.paper.colors.accent, ...styles.button}}
        onPress={() => {
          typeof newTitle === 'string' &&
            newTitle.length &&
            newTitleExists.length === 0 &&
            typeof newColor === 'string' &&
            newColor.length &&
            saveNewDataType(newDataType);
        }}>
        <Text>SAVE</Text>
      </TouchableOpacity>
      <Button onPress={() => saveNewDataType()}>
        <Text>cancel</Text>
      </Button>
    </SafeAreaView>
  );
};

type Props = {
  dataTypeId?: string;
  value?: DataType | string;
  onValueChange: (datatype: DataType) => void;
};

const DataTypesComponent = ({
  dataTypeId,
  value,
  onValueChange,
}: Props) => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const cache = useQueryCache();
  const fetchDataTypes = (path: string) => getDatatypes(user);
  const {
    data,
    status,
    error,
  } = useQuery<
    DataTypesType,
    Error,
    [string, number | undefined]
  >('users/datatypes', fetchDataTypes, {suspense: true});
  const [saveDataType] = useMutation((d: DataType) => addDataType(user, d), {
    onSuccess: (d) => {
      queryCache.setQueryData<DataTypesType>('users/datatypes', (old) => {
        const newDataTypes: DataTypesType = {};
        if (d.key) {
          newDataTypes[d.key] = d;
        }
        if (old) {
          return {...old, ...newDataTypes};
        } else {
          return newDataTypes;
        }
      });
    },
    onSettled: () => cache.invalidateQueries('users/datatypes'),
  });
  const datatypes = data || {};
  const [visible, setVisible] = React.useState(false);
  const [selected, setSelected] = React.useState(
    typeof value === 'string'
      ? datatypes[value]?.title
      : value?.title ||
          (datatypes &&
            dataTypeId &&
            datatypes[dataTypeId] &&
            datatypes[dataTypeId].title) ||
          defaultTypeTitle,
  );
  const datatypesArray = firebaseDocumentToArray<DataType>(datatypes);
  if (!user) {
    return <View />;
  } else if (status === QueryStatus.Loading) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching posts: {error?.message}</Text>;
  } else {
    return (
      <View style={styles.container}>
        <Text style={{color: theme.paper.colors.text}}>Type</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            style={pickerStyles}
            items={datatypesArray.map((dt) => ({
              label: dt.title,
              value: dt.title,
            }))}
            value={selected}
            onValueChange={(itemValue, itemIndex) => {
              const sel = datatypesArray.filter(
                (dt) => dt.title === itemValue.toString(),
              )[0];
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
              saveNewDataType={(datatype?: DataType) => {
                if (datatype) {
                  saveDataType(datatype).then((dt) => {
                    setVisible(false);
                    dt && onValueChange(dt);
                  });
                } else {
                  setVisible(false);
                }
              }}
            />
          </Modal>
        </Portal>
      </View>
    )
  }
}

const DataTypes = ({
  dataTypeId,
  value,
  onValueChange,
}: Props) => {
  return (
    <View>
      <React.Suspense fallback={<ActivityIndicator />}>
        <DataTypesComponent
          dataTypeId={dataTypeId}
          value={value}
          onValueChange={onValueChange} />
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerContainer: {
    flex: 1,
    marginLeft: 20,
    maxWidth: '80%',
  },
  flex: {
    flex: 1,
  },
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
    paddingVertical: 16,
  },
});

export default DataTypes;
