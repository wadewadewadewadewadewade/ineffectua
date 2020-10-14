import * as React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import {Text, TextInput, ActivityIndicator} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {
  getTagsForAutocomplete,
  getTagsByKeyArray,
  addTagWithDispatch,
  getTagIdsForUser,
} from '../../middleware/TagsMiddleware';
import {State} from '../../Types';
import {paperColors} from '../../reducers/ThemeReducer';
import {Tag} from '../../reducers/TagsReducer';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {TouchableHighlight, FlatList} from 'react-native-gesture-handler';
import {useQuery, QueryStatus} from 'react-query';

const TagComponent = ({
  tag,
  removeTag,
}: {
  tag: Tag;
  removeTag?: (key: string) => void;
}) => {
  const {key, name} = tag;
  const theme = useSelector((state: State) => state.theme);
  if (key === undefined) {
    return <View />;
  }
  return (
    <View
      style={[
        styles.tag,
        {
          borderRadius: theme.paper.roundness,
          backgroundColor: theme.paper.colors.backdrop,
        },
      ]}>
      <Text style={[styles.tagText, {color: paperColors(theme).onSurface}]}>
        {name}
      </Text>
      {removeTag !== undefined && (
        <MaterialCommunityIcons
          onPress={() => {
            removeTag(key);
          }}
          name="delete"
          color={paperColors(theme).onSurface}
          size={26}
        />
      )}
    </View>
  );
};

const TagSuggestion = ({
  name,
  index,
  onPress,
}: {
  name: string;
  index: number;
  onPress: (index: number) => void;
}) => {
  return (
    <TouchableHighlight
      style={styles.pickerItem}
      onPress={() => onPress(index)}>
      <Text>{name}</Text>
    </TouchableHighlight>
  );
};

const TagList = ({
  value,
  onTagsChanged,
}: {
  value?: Array<string>;
  onTagsChanged?: (tags: Array<string>) => void;
}) => {
  const {status, data, isFetching, error} = useQuery<Tag[], Error, [string]>(
    JSON.stringify(value),
    getTagsByKeyArray,
    {suspense: true},
  );
  const tags = data || [];
  if (!value) {
    return <View />;
  }
  if (status === QueryStatus.Loading || isFetching) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching tags: {error?.message}</Text>;
  } else if (onTagsChanged) {
    return (
      <View style={styles.tagListContainer}>
        {tags.length > 0 &&
          tags.map((t: Tag) => (
            <TagComponent
              key={t.key as string}
              tag={t}
              removeTag={(key) =>
                onTagsChanged(
                  tags
                    .filter((ta: Tag) => ta.key !== key)
                    .map((ta: Tag) => ta.key as string),
                )
              }
            />
          ))}
        <NewTagField
          tags={tags}
          onTagsChanged={(tag) =>
            onTagsChanged([
              ...tags.map((t: Tag) => t.key as string),
              tag.key as string,
            ])
          }
        />
      </View>
    );
  } else {
    return (
      <View>
        {tags &&
          tags.length > 0 &&
          tags.map((t: Tag) => <TagComponent key={t.key as string} tag={t} />)}
      </View>
    );
  }
};

const NewTagField = ({
  tags,
  onTagsChanged,
}: {
  tags: Array<Tag>;
  onTagsChanged: (newTag: Tag) => void;
}) => {
  const [tagName, setTagName] = React.useState<string>('');
  const theme = useSelector((state: State) => state.theme);
  const dispatch = useDispatch();
  const {status, data, isFetching, error} = useQuery<
    Tag[],
    Error,
    [string, Array<Tag>]
  >(tagName, getTagsForAutocomplete, {suspense: false});
  return (
    <View style={styles.pickerContainer}>
      <TextInput
        style={[
          styles.pickerTextInput,
          {backgroundColor: theme.paper.colors.surface},
        ]}
        value={tagName}
        onChangeText={(text: string) => {
          setTagName(text);
        }}
        onBlur={() => {
          // onBlur was firing before clicks inside the type-ahead suggestions could regester
          setTimeout(() => {
            if (tagName.length > 0) {
              setTagName('');
            }
          }, 100);
        }}
        onKeyPress={(e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
          const key = e.nativeEvent.key;
          if (key.toLowerCase() === 'enter') {
            e.stopPropagation();
            if (tagName.length > 0) {
              const tagNames = tags.filter(
                (t) => t.name.toLowerCase() === tagName.toLowerCase(),
              );
              if (tagNames.length === 0) {
                // if the tag isn't alread in the list, try adding it
                dispatch(
                  addTagWithDispatch({name: tagName}, (t) => onTagsChanged(t)),
                );
              } else {
                onTagsChanged({name: tagName});
              }
            }
          }
        }}
      />
      <View
        style={[styles.picker, {backgroundColor: theme.paper.colors.surface}]}>
        {status === QueryStatus.Loading && <ActivityIndicator />}
        {status === QueryStatus.Error && (
          <Text>An error occured fetching tags: {error?.message}</Text>
        )}
        {data && (
          <FlatList<Tag>
            data={data}
            renderItem={({item, index}) => (
              <TagSuggestion
                name={item.name}
                index={index}
                onPress={(i) => {
                  const selected = data[i];
                  onTagsChanged(selected);
                }}
              />
            )}
            keyExtractor={(i) => i.key || i.name}
            refreshing={isFetching}
          />
        )}
      </View>
    </View>
  );
};

type Props = {
  value?: Array<string>;
  userId?: string;
  style?: StyleProp<ViewStyle>;
  onTagsChanged?: (tags: Array<string>) => void;
};

const Tags = ({value, userId, style, onTagsChanged}: Props) => {
  const [tagIds, setTagIds] = React.useState(value);
  const userTagIds = useQuery<string[], Error, [string]>(
    userId,
    getTagIdsForUser,
    {suspense: true},
  ).data;
  if (!value && !tagIds && userId) {
    setTagIds(userTagIds);
  }
  const theme = useSelector((state: State) => state.theme);
  return (
    <View
      style={[
        styles.pickerContainer,
        {
          backgroundColor: theme.paper.colors.surface,
          borderRadius: theme.paper.roundness,
        },
        style,
      ]}>
      <View style={styles.tagsContainer}>
        <Text style={[styles.label, {color: theme.paper.colors.text}]}>
          Tags
        </Text>
        <React.Suspense fallback={<ActivityIndicator />}>
          {onTagsChanged ? (
            <TagList value={tagIds} onTagsChanged={onTagsChanged} />
          ) : (
            <TagList value={tagIds} />
          )}
        </React.Suspense>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
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
  tag: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    flexGrow: 0,
    padding: 8,
    margin: 8,
  },
  tagListContainer: {
    flexDirection: 'row',
  },
  tagText: {
    fontSize: 16,
  },
  label: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pickerContainer: {
    position: 'relative',
    minHeight: 64,
  },
  pickerTextInput: {
    marginHorizontal: 8,
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
    elevation: 4,
    zIndex: 4,
  },
  pickerItem: {
    padding: 8,
  },
});

export default Tags;
