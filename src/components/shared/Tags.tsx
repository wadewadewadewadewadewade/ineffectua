import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import RNPickerSelect, { PickerStyle } from 'react-native-picker-select';
import { Text } from 'react-native-paper';
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
  addNewTag: (tag: Tag, onComplete: (tag: Tag) => void) => void
};

const Tags = ({
  value,
  tags,
  theme,
  addNewTag,
}: Props) => {
  const tagsArray = firebaseDocumentToArray<Tag>(tags);
  const [tagsForPost, setTagsForPost] = React.useState<Array<Tag>>([])
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
      <View>
        {tagsArray.map(t => (<TagComponent {...t} theme={theme}
          removeTag={key => setTagsForPost(tagsForPost.filter(t1 => t1.key !== key))} />))}
      </View>
      <Text style={{color: theme.paper.colors.text}}>Tags</Text>
      <View style={{flex:1,marginLeft:20,maxWidth:'80%'}}>
        <RNPickerSelect
          style={pickerStyles}
          items={tagsArray.map(t => ({label:t.name,value:t.key}))}
          onValueChange={(tagKey, itemIndex) => {
            setTagsForPost([...tagsForPost, tags[tagKey]])
          }}
          />
      </View>
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
  addNewTag: (tag: Tag, onComplete: (tag: Tag) => void) => void
}

const mapStateToProps = (state: State, ownProps: OwnProps) => {
  return {
    user: state.user,
    theme: state.theme,
    tags: state.tags,
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, firebase.app.App, any>, ownProps: OwnProps): DispatchProps => {
  dispatch(getTags(ownProps.value))
  return {
    addNewTag: (tag: Tag, onComplete: (tag: Tag) => void) => {
      dispatch(addTag(tag, onComplete))
    }
  };
};// Exports
export default connect(mapStateToProps, mapDispatchToProps)(Tags);