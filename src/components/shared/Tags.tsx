import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addTagWithDispatch, getTagsForAutocomplete, getTagsByKeyArray } from '../../middleware/TagsMiddleware';
import { State } from '../../Types';
import { ThemeState, Theme, paperColors } from '../../reducers/ThemeReducer';
import { Tag } from '../../reducers/TagsReducer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableHighlight, FlatList } from 'react-native-gesture-handler';
import { wrapPromise, WrappedPromise } from '../../middleware';

const TagComponent = ({
  tag,
  theme,
  removeTag
}: { tag: Tag, theme: Theme, removeTag?: (key: string) => void }) => {
  const { key, name } = tag
  if (key === undefined) {
    return (<View/>)
  }
  return (
    <View style={[styles.tag, {borderRadius: theme.paper.roundness, backgroundColor: theme.paper.colors.backdrop}]}>
      <Text style={[styles.tagText, {color: paperColors(theme).onSurface}]}>{name}</Text>
      {removeTag !== undefined && <MaterialCommunityIcons onPress={() => {
        removeTag(key)
      }} name="delete" color={paperColors(theme).onSurface} size={26} />}
    </View>
  )
}

const TagSuggestion = ({
  name,
  index,
  onPress,
} : {
  name: string,
  index: number,
  onPress: (index: number) => void,
}) => {
  return (<TouchableHighlight style={styles.pickerItem} onPress={() => onPress(index)}><Text>{name}</Text></TouchableHighlight>)
}

const TagList = ({
  tagsResource,
  theme,
  onTagsChanged,
} : {
  tagsResource: WrappedPromise<Array<Tag>>,
  theme: Theme,
  onTagsChanged?: (tags: Array<string>) => void
}) => {
  const tags = tagsResource.read()
  if (onTagsChanged) {
    return (
      <View style={{flexDirection: 'row'}}>
        {tags.map(t => 
          <TagComponent
            key={t.key as string}
            tag={t}
            theme={theme}
            removeTag={key => onTagsChanged(tags.filter(ta => ta.key !== key).map(ta => ta.key as string))} />
        )}
        <NewTagField
          tags={tags}
          theme={theme}
          onTagsChanged={(tag => 
            onTagsChanged([...tags.map(t => t.key as string), tag.key as string])
          )} />
      </View>
    )
  } else {
    return (
      <View>
        {tags.map(t =>
          <TagComponent
            key={t.key as string}
            tag={t}
            theme={theme} />
        )}
      </View>
    )
  }
}

const NewTagField = ({
  tags,
  theme,
  onTagsChanged,
} : {
  tags: Array<Tag>,
  theme: Theme,
  onTagsChanged: (newTag: Tag) => void,
}) => {
  const [tagName, setTagName] = React.useState<string>('')
  const [suggestions, setSuggestions] = React.useState<Array<Tag>>([]);
  const tagIds: Array<string> = tags.map(t => t.key || t.name)
  return (
    <View style={{position: 'relative'}}>
      <TextInput
        style={{backgroundColor: theme.paper.colors.surface, marginHorizontal: 8}}
        value={tagName}
        onChangeText={(text: string) => {
          setTagName(text)
          getTagsForAutocomplete(text).then(t => setSuggestions(t.filter(ta => tagIds.indexOf(ta.key || ta.name) === -1)))
        }}
        onBlur={() => {
          // onBlur was firing before clicks inside the type-ahead suggestions could regester
          setTimeout(() => {
            if (tagName.length > 0) {
              setTagName('')
            }
            if (suggestions.length > 0) { // close type-ahead suggestions if they are shown
              setSuggestions([])
            }
          }, 100)
        }}
        onKeyPress={(e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
          const key = e.nativeEvent.key
          if (key.toLowerCase() === 'enter') {
            e.stopPropagation()
            if (tagName.length > 0) {
              const tagNames = tags.filter(t => t.name.toLowerCase() === tagName.toLowerCase())
              if (tagNames.length === 0) { // if the tag isn't alread in the list, try adding it
                onTagsChanged({ name: tagName })
              }
            }
          }
        }}
      />
      <View style={[styles.picker, { backgroundColor: theme.paper.colors.surface }]}>
        <FlatList<Tag>
          data={suggestions}
          renderItem={({item, index}) => (
            <TagSuggestion
              name={item.name}
              index={index}
              onPress={i => {
                const selected = suggestions[i]
                onTagsChanged(selected)
              }}
            />
          )}
          keyExtractor={i => i.key || i.name}
          />
      </View>
    </View>
  )
}

type Props = {
  theme: ThemeState['theme'],
  addTagToPost: (tag: Tag) => Promise<Tag>, 
  value?: Array<string>,
  style?: StyleProp<ViewStyle>,
  onTagsChanged?: (tags: Array<string>) => void
}

const Tags = ({
  value,
  theme,
  style,
  onTagsChanged
}: Props) => {
  const tags = value ? wrapPromise(getTagsByKeyArray(value)) : wrapPromise(new Promise<Array<Tag>>(r => []))
  return (
    <View style={[{backgroundColor: theme.paper.colors.surface, borderRadius: theme.paper.roundness}, style]}>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center'}}>
        <Text style={[styles.label, {color: theme.paper.colors.text}]}>Tags</Text>
        <React.Suspense fallback={<ActivityIndicator/>}>
          {value && (
            onTagsChanged ?
              <TagList tagsResource={tags} theme={theme} onTagsChanged={onTagsChanged} />
            :
              <TagList tagsResource={tags} theme={theme} />
          )}
        </React.Suspense>
      </View>
    </View>
  )
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
  tag: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    flexGrow: 0,
    padding: 8,
  },
  tagText: {
    fontSize: 16
  },
  label: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  picker: {
    position: 'absolute',
    zIndex: 2,
    left: 0,
    right: 0,
    top: '100%',
  },
  pickerItem: {
    padding:8
  },
});

interface OwnProps {
  value?: Array<string>
}

interface DispatchProps {
  addTagToPost: (tag: Tag) => Promise<Tag>
}

const mapStateToProps = (state: State, ownProps: OwnProps) => {
  return {
    user: state.user,
    theme: state.theme,
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, firebase.app.App, any>, ownProps: OwnProps): DispatchProps => {
  return {
    addTagToPost: (tag: Tag) => new Promise<Tag>((resolve, reject) => { dispatch(addTagWithDispatch(tag, resolve)) })
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Tags);