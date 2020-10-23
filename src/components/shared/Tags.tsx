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
import {useSelector} from 'react-redux';
import {
  getTagsForAutocomplete,
  getTagsByKeyArray,
  getTagsForUser,
  addTag,
  addTagForUser,
  deleteTagForUser,
} from '../../middleware/TagsMiddleware';
import {State} from '../../Types';
import {paperColors} from '../../reducers/ThemeReducer';
import {Tag, UserTag} from '../../reducers/TagsReducer';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {TouchableHighlight, FlatList} from 'react-native-gesture-handler';
import {
  useQuery,
  QueryStatus,
  queryCache,
  useMutation,
  useQueryCache,
} from 'react-query';
import {navigate} from '../RootNavigation';
import {MaterialBottomTabNavigationProp} from '@react-navigation/material-bottom-tabs';
import {MaterialBottomTabParams} from '../MaterialBottomTabs';
import {PostPrivacyTypes, PostCriteria} from '../../reducers/PostsReducer';

const TagComponent = ({
  tag,
  removeTag,
  navigation,
}: {
  tag: Tag;
  removeTag?: (key: string) => void;
  navigation?: MaterialBottomTabNavigationProp<
    MaterialBottomTabParams,
    'Agenda'
  >;
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
      <TouchableHighlight
        onPress={() => {
          const criteria: PostCriteria = {
            privacy: PostPrivacyTypes.PUBLIC,
            key: {id: tag.key, type: 'tags'},
          };
          if (navigation !== undefined) {
            navigation.navigate(criteria);
          } else {
            navigate('Agenda', criteria);
          }
        }}>
        <Text style={[styles.tagText, {color: paperColors(theme).onSurface}]}>
          {name}
        </Text>
      </TouchableHighlight>
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
  navigation,
}: {
  value?: Array<string>;
  onTagsChanged?: (tags: Array<string>) => void;
  navigation?: MaterialBottomTabNavigationProp<
    MaterialBottomTabParams,
    'Agenda'
  >;
}) => {
  const {status, data, isFetching, error} = useQuery<
    Tag[],
    Error,
    [string, string[]]
  >(['/tags', value], (path, tagIds) => getTagsByKeyArray(tagIds), {
    suspense: true,
  });
  const tags = data || [];
  if (!value) {
    return <View />;
  }
  if (status === QueryStatus.Loading || isFetching) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching tags: {error?.message}</Text>;
  } else if (onTagsChanged) {
    // only allow max of 10 tags - for Firesitre 'where in []' reasons, and also seems unnecessary
    return (
      <View style={styles.tagListContainer}>
        {tags.length > 0 &&
          tags.map((t: Tag) => (
            <TagComponent
              navigation={navigation}
              key={t.key}
              tag={t}
              removeTag={(key) =>
                onTagsChanged(
                  tags
                    .filter((ta: Tag) => ta.key !== key)
                    .map((ta: Tag) => ta.key),
                )
              }
            />
          ))}
        {tags.length < 10 && (
          <NewTagField
            tags={tags}
            onTagsChanged={(tag) =>
              onTagsChanged([...tags.map((t: Tag) => t.key), tag.key])
            }
          />
        )}
      </View>
    );
  } else {
    return (
      <View>
        {tags &&
          tags.length > 0 &&
          tags.map((t: Tag) => (
            <TagComponent navigation={navigation} key={t.key} tag={t} />
          ))}
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
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const cache = useQueryCache();
  const {status, data, isFetching, error} = useQuery<
    Tag[],
    Error,
    [string, Array<string>]
  >(tagName, getTagsForAutocomplete, {suspense: false});
  const [mutateAdd] = useMutation((tag: Tag) => addTag(user, tag), {
    onSuccess: (t) => {
      queryCache.setQueryData<Array<Tag>>('/tags', (old) => {
        if (old) {
          return [t, ...old];
        } else {
          return [t];
        }
      });
    },
    onSettled: () => cache.invalidateQueries('/tags'),
  });
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
                mutateAdd({key: '', name: tagName}).then(
                  (t) => t && onTagsChanged(t),
                );
              } else {
                onTagsChanged({key: '', name: tagName});
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
  navigation?: MaterialBottomTabNavigationProp<
    MaterialBottomTabParams,
    'Agenda'
  >;
};

const TagsListComponent = ({
  value,
  userId,
  style,
  onTagsChanged,
  navigation,
}: Props) => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const [tagIds, setTagIds] = React.useState(value);
  const queryKey = userId
    ? `/users/${userId}/tags`
    : user
    ? `/users/${user.uid}/tags`
    : '/users/tags';
  let getUserTags = (path: string, cursor = 0) =>
    new Promise<Array<UserTag>>((r) => r([]));
  if (userId !== undefined) {
    getUserTags = (path: string, cursor = 0) =>
      getTagsForUser(user, userId, cursor);
  }
  const {data, status, error} = useQuery<
    Array<UserTag>,
    Error,
    [string, number | undefined]
  >(queryKey, getUserTags, {suspense: true});
  const userTags = data;
  const cache = useQueryCache();
  const [mutateAdd] = useMutation((tag: UserTag) => addTagForUser(user, tag), {
    onSuccess: (t) => {
      let newUserTags = [t];
      if (userTags) {
        newUserTags = [...userTags, t];
      }
      queryCache.setQueryData<Array<UserTag>>(queryKey, newUserTags);
    },
    onSettled: () => cache.invalidateQueries(queryKey),
  });
  const [mutateRemove] = useMutation(
    (tag: UserTag) => deleteTagForUser(user, tag),
    {
      onSuccess: (t) => {
        let newUserTags = new Array<UserTag>();
        if (userTags) {
          newUserTags = userTags.filter((ut) => ut.key !== t.key);
        }
        queryCache.setQueryData(queryKey, newUserTags);
      },
      onSettled: (t) => cache.invalidateQueries(queryKey),
    },
  );
  if ((!tagIds && userId) || (userId && userTags?.length !== tagIds?.length)) {
    setTagIds(userTags?.map((ut) => ut.tagId));
  }
  if (status === QueryStatus.Loading) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching posts: {error?.message}</Text>;
  } else {
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
          {onTagsChanged ? (
            <TagList
              navigation={navigation}
              value={tagIds}
              onTagsChanged={(updatedTagIds) => {
                if (userId !== undefined) {
                  const addedTagIds = new Array<string>();
                  const removedTagIds = new Array<string>();
                  updatedTagIds.forEach((t) => {
                    if (!tagIds?.includes(t)) {
                      addedTagIds.push(t);
                    }
                  });
                  tagIds?.forEach((t) => {
                    if (!updatedTagIds.includes(t)) {
                      removedTagIds.push(t);
                    }
                  });
                  addedTagIds.forEach((tagId) => {
                    mutateAdd({key: '', tagId} as UserTag);
                  });
                  removedTagIds.forEach((tagId) => {
                    mutateRemove(userTags?.find((ut) => ut.tagId === tagId));
                  });
                }
                onTagsChanged(updatedTagIds);
              }}
            />
          ) : (
            <TagList navigation={navigation} value={tagIds} />
          )}
        </View>
      </View>
    );
  }
};

export const Tags = (props: Props) => {
  return (
    <View style={styles.tagsRelativeContainer}>
      <React.Suspense fallback={<ActivityIndicator />}>
        <TagsListComponent {...props} />
      </React.Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  tagsRelativeContainer: {
    position: 'relative',
    zIndex: 2,
    elevation: 2,
  },
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
    flex: 1,
    flexBasis: 'min-content',
  },
  tagListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tagText: {
    fontSize: 16,
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  pickerContainer: {
    position: 'relative',
    justifyContent: 'center',
    flex: 1,
    minWidth: 70,
  },
  pickerTextInput: {
    marginHorizontal: 8,
    borderWidth: 0,
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
