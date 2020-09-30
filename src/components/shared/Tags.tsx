import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import { Text, TextInput } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addTag, getTags } from '../../middleware/TagsMiddleware';
import { State } from '../../Types';
import { ThemeState, Theme, paperColors } from '../../reducers/ThemeReducer';
import { firebaseDocumentToArray } from '../../firebase/utilities';
import { TagsType, Tag } from '../../reducers/TagsReducer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TagComponent = ({
  name,
  key,
  theme,
  removeTag
}: Tag & { theme: Theme, removeTag: (key: string) => void }) => {
  if (key === undefined) {
    return (<View/>)
  }
  return (
    <View style={{borderRadius: theme.paper.roundness, backgroundColor: theme.paper.colors.backdrop}}>
      <Text style={[styles.tagText, {color: paperColors(theme).onSurface}]}>{name}</Text>
      <MaterialCommunityIcons onPress={() => {
        removeTag(key)
      }} name="delete" color={paperColors(theme).onSurface} size={26} />
    </View>
  )
}

type Props = {
  value?: Array<string>,
  tags: TagsType,
  theme: ThemeState['theme'],
  style: StyleProp<ViewStyle>,
  addNewTag: (tag: Tag) => void,
  getTagsForPrefix: (prefix: string) => Promise<Array<Tag>>
};

const Tags = ({
  tags,
  theme,
  style,
  addNewTag,
  getTagsForPrefix,
}: Props) => {
  const [tagName, setTagName] = React.useState<string>('')
  const [tagsForPost, setTagsForPost] = React.useState<Array<Tag>>([])
  let alternateKey = 0
  return (
    <View style={[{backgroundColor: theme.paper.colors.surface, borderRadius: theme.paper.roundness}, style]}>
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Text style={{color: theme.paper.colors.text}}>Tags</Text>
        {tagsForPost.map(t => (<TagComponent key={t.key || 'key' + alternateKey++} {...t} theme={theme}
          removeTag={key => setTagsForPost(tagsForPost.filter(t1 => t1.key !== key))} />))}
        <TextInput
          style={{backgroundColor: theme.paper.colors.surface}}
          value={tagName}
          onChangeText={(text: string) => {
            setTagName(text)
            getTagsForPrefix(text)
          }}
          onKeyPress={(e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
            const key = e.nativeEvent.key
            if (key.toLowerCase() === 'enter') {
              addNewTag({ name: tagName })
            }
          }}
        />
      </View>
      {Object.keys(tags).length > 0 && <View style={{flex:1}}>
        <RNPickerSelect
          style={pickerStyles}
          items={firebaseDocumentToArray(tags).map(t => ({label:t.name,value:t.key}))}
          onValueChange={(tagKey, itemIndex) => {
            setTagsForPost([...tagsForPost, tags[tagKey]])
          }}
          />
      </View>}
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
  tagText: {
    fontSize: 16
  },
});

interface OwnProps {
  value?: Array<string>
}

interface DispatchProps {
  addNewTag: (tag: Tag) => void,
  getTagsForPrefix: (prefix: string) => Promise<Array<Tag>>
}

const mapStateToProps = (state: State, ownProps: OwnProps) => {
  return {
    user: state.user,
    theme: state.theme,
    tags: state.tags,
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, firebase.app.App, any>, ownProps: OwnProps): DispatchProps => {
  ownProps.value && dispatch(getTags(ownProps.value))
  return {
    addNewTag: (tag: Tag) => {
      dispatch(addTag(tag, (t) => dispatch(getTags([t.name]))))
    },
    getTagsForPrefix: (prefix: string) => new Promise((s,f) => {
      dispatch(getTags([prefix]))
    })
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Tags);