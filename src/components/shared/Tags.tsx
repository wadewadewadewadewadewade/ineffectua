import * as React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { Text, TextInput} from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { addTag, getTagsForAutocomplete, getTagsByKeyArray } from '../../middleware/TagsMiddleware';
import { State } from '../../Types';
import { ThemeState, Theme, paperColors } from '../../reducers/ThemeReducer';
import { Tag } from '../../reducers/TagsReducer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthState } from '../../reducers/AuthReducer';
import { TouchableHighlight, FlatList } from 'react-native-gesture-handler';

const TagComponent = ({
  tag,
  theme,
  removeTag
}: { tag: Tag, theme: Theme, removeTag: (key: string) => void }) => {
  const { key, name } = tag
  if (key === undefined) {
    return (<View/>)
  }
  return (
    <View style={[styles.tag, {borderRadius: theme.paper.roundness, backgroundColor: theme.paper.colors.backdrop}]}>
      <Text style={[styles.tagText, {color: paperColors(theme).onSurface}]}>{name}</Text>
      <MaterialCommunityIcons onPress={() => {
        removeTag(key)
      }} name="delete" color={paperColors(theme).onSurface} size={26} />
    </View>
  )
}

type Props = {
  value?: Array<string>,
  dynamic?: boolean,
  user: AuthState['user'],
  theme: ThemeState['theme'],
  style?: StyleProp<ViewStyle>,
  onTagsChanged?: (tags: Array<Tag>) => void
};

const Tags = ({
  value,
  dynamic,
  user,
  theme,
  style,
  onTagsChanged,
}: Props) => {
  const [tagName, setTagName] = React.useState<string>('')
  const [tagsForPost, setTagsForPost] = React.useState<Array<Tag>>([])
  const [suggestions, setSuggestions] = React.useState<Array<Tag>>([]);
  console.log({tagsForPost})
  if (value && value.length > 0) {
    getTagsByKeyArray(value).then(t => setTagsForPost(t))
  }
  let alternateKey = 0
  const Suggestion = ({
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
  return (
    <View style={[{backgroundColor: theme.paper.colors.surface, borderRadius: theme.paper.roundness}, style]}>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center'}}>
        <Text style={[styles.label, {color: theme.paper.colors.text}]}>Tags</Text>
        {tagsForPost.length > 0 && tagsForPost.map(t => (<TagComponent key={t.key || 'key' + alternateKey++} tag={t} theme={theme}
          removeTag={key => setTagsForPost(tagsForPost.filter(t1 => t1.key !== key))} />))}
        {dynamic && <View style={{position: 'relative'}}>
          <TextInput
            style={{backgroundColor: theme.paper.colors.surface}}
            value={tagName}
            onChangeText={(text: string) => {
              setTagName(text)
              getTagsForAutocomplete(text).then(t => setSuggestions(t))
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
                const tagNames = tagsForPost.filter(t => t.name.toLowerCase() === tagName.toLowerCase())
                if (tagNames.length === 0) { // if the tag isn't alread in the list, try adding it
                  addTag(user, { name: tagName }).then(t => {
                    setTagsForPost([...tagsForPost, t])
                    onTagsChanged && onTagsChanged([...tagsForPost, t])
                  })
                  if (suggestions.length > 0) { // close type-ahead suggestions if they are shown
                    setSuggestions([])
                  }
                }
              }
            }}
          />
          <View style={[styles.picker, { backgroundColor: theme.paper.colors.surface }]}>
            <FlatList<Tag>
              data={suggestions}
              renderItem={({item, index}) => (
                <Suggestion
                  name={item.name}
                  index={index}
                  onPress={i => {
                    console.log({suggestions, index})
                    setTagsForPost([...tagsForPost, suggestions[index]])
                    setSuggestions([])
                  }}
                />
              )}
              keyExtractor={i => i.key || i.name}
              />
          </View>
        </View>}
      </View>
    </View>
  );
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
}

const mapStateToProps = (state: State, ownProps: OwnProps) => {
  return {
    user: state.user,
    theme: state.theme,
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, firebase.app.App, any>, ownProps: OwnProps): DispatchProps => {
  return {
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Tags);