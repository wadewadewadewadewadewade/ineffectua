import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { getTagsForAutocomplete, getTagsByKeyArray, addTagWithDispatch } from '../../middleware/TagsMiddleware';
import { State } from '../../Types';
import { paperColors } from '../../reducers/ThemeReducer';
import { Tag } from '../../reducers/TagsReducer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableHighlight, FlatList } from 'react-native-gesture-handler';
import { wrapPromise, WrappedPromise } from '../../middleware';

const TagComponent = ({
  tag,
  removeTag
}: { tag: Tag, removeTag?: (key: string) => void }) => {
  const { key, name } = tag
  if (key === undefined) {
    return (<View/>)
  }
  const theme = useSelector((state: State) => state.theme)
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
  onTagsChanged,
} : {
  tagsResource: WrappedPromise<Array<Tag>>,
  onTagsChanged?: (tags: Array<string>) => void
}) => {
  const tags = tagsResource.read()
  if (onTagsChanged) {
    return (
      <View style={{flexDirection: 'row'}}>
        {tags && tags.length > 0 && tags.map(t => 
          <TagComponent
            key={t.key as string}
            tag={t}
            removeTag={key => onTagsChanged(tags.filter(ta => ta.key !== key).map(ta => ta.key as string))} />
        )}
        <NewTagField
          tags={tags}
          onTagsChanged={(tag => 
            onTagsChanged([...tags.map(t => t.key as string), tag.key as string])
          )} />
      </View>
    )
  } else {
    return (
      <View>
        {tags && tags.length > 0 && tags.map(t =>
          <TagComponent
            key={t.key as string}
            tag={t} />
        )}
      </View>
    )
  }
}

const NewTagField = ({
  tags,
  onTagsChanged,
} : {
  tags: Array<Tag>,
  onTagsChanged: (newTag: Tag) => void,
}) => {
  const [tagName, setTagName] = React.useState<string>('')
  const [suggestions, setSuggestions] = React.useState<Array<Tag>>([]);
  const tagIds: Array<string> = tags.map(t => t.key || t.name)
  const theme = useSelector((state: State) => state.theme)
  const dispatch = useDispatch()
  return (
    <View style={styles.pickerContainer}>
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
                dispatch(addTagWithDispatch({ name: tagName }, t => onTagsChanged(t)))
              } else {
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
  value?: Array<string>,
  style?: StyleProp<ViewStyle>,
  onTagsChanged?: (tags: Array<string>) => void
}

const Tags = ({
  value,
  style,
  onTagsChanged
}: Props) => {
  const tags = value && value.length > 0 ? wrapPromise(getTagsByKeyArray(value)) : wrapPromise(new Promise<Array<Tag>>(r => r([])))
  const theme = useSelector((state: State) => state.theme)
  return (
    <View style={[styles.pickerContainer, {backgroundColor: theme.paper.colors.surface, borderRadius: theme.paper.roundness}, style]}>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center'}}>
        <Text style={[styles.label, {color: theme.paper.colors.text}]}>Tags</Text>
        <React.Suspense fallback={<ActivityIndicator style={{minHeight:64}} />}>
          {onTagsChanged ?
            <TagList tagsResource={tags} onTagsChanged={onTagsChanged} />
          :
            <TagList tagsResource={tags} />
          }
        </React.Suspense>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
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
    paddingVertical: 16
  },
  tag: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    flexGrow: 0,
    padding: 8,
    margin: 8,
  },
  tagText: {
    fontSize: 16
  },
  label: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pickerContainer: {
    position: 'relative',
    minHeight: 64,
  },
  picker: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerItem: {
    padding:8
  },
});

export default Tags;