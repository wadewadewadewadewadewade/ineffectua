import * as React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  FlatList,
  LayoutChangeEvent,
  Alert,
  Platform,
} from 'react-native';
import {Text, ActivityIndicator, Avatar} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {State} from '../../Types';
import {
  Post,
  PostCriteria,
  PostPrivacyTypes,
  getPostPrivacyName,
} from '../../reducers/PostsReducer';
import {
  fetchPosts,
  emptyPost,
  addPost,
  deletePost,
} from '../../middleware/PostsMiddleware';
import Slider from '@react-native-community/slider';
import Tags from './Tags';
import FlexableTextArea from './FlexableTextArea';
import {SafeAreaView} from 'react-native-safe-area-context';
import {formatDateConditionally} from '../../middleware/CalendarMiddleware';
import {
  useInfiniteQuery,
  QueryStatus,
  useQuery,
  useMutation,
  queryCache,
} from 'react-query';
import {User} from '../../reducers/AuthReducer';
import {getUserById} from '../../middleware/AuthMiddleware';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {NavigationContainerRef} from '@react-navigation/native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

// used for a list of posts, for comments within a post, messages between users, and for searching maybe?

const PostPrivacy = ({
  getValue,
}: {
  getValue: (privacy: PostPrivacyTypes) => void;
}) => {
  const [privacy, setPrivacy] = React.useState(0 as PostPrivacyTypes);
  return (
    <View style={styles.postPrivacyContainer}>
      <Text>{getPostPrivacyName(privacy)}</Text>
      <Slider
        style={styles.flex}
        value={privacy}
        step={1}
        minimumValue={0}
        maximumValue={2}
        onValueChange={(s: number) => {
          setPrivacy(s);
          getValue(s);
        }}
      />
    </View>
  );
};

type ComposePostProps = {
  criteria: PostCriteria;
  height?: (componentHeight: number) => void;
  onSavePost: (post: Post) => void;
};

const ComposePost = ({criteria, height, onSavePost}: ComposePostProps) => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const textStyle: ViewStyle = {
    borderRadius: theme.paper.roundness,
    borderColor: theme.paper.colors.accent,
    backgroundColor: theme.paper.colors.onSurface,
  };
  const [tags, setTags] = React.useState(new Array<string>());
  const isMessage =
    criteria.key !== undefined && criteria.key.type === 'messages';
  let privacy = PostPrivacyTypes.PUBLIC;
  const savePostIfValid = (body: string) => {
    if (/[^\s]+/.test(body)) {
      const newPost: Post = {
        key: '',
        body,
        tags,
        criteria: {...criteria, privacy},
        created: {
          by: user ? user.uid : 'unknown',
          on: new Date(),
        },
      };
      onSavePost(newPost);
      tags.length > 0 && setTags([]);
    }
  };
  if (!user) {
    return (
      <View
        onLayout={(e: LayoutChangeEvent) => {
          const value = e.nativeEvent.layout.height;
          height && height(value);
        }}
        style={[
          styles.composePostContent,
          {backgroundColor: theme.paper.colors.surface},
        ]}>
        <Text style={[styles.composePostText, textStyle]}>Please sign in</Text>
      </View>
    );
  } else if (isMessage) {
    return (
      <View
        onLayout={(e: LayoutChangeEvent) => {
          const value = e.nativeEvent.layout.height;
          height && height(value);
        }}
        style={[
          styles.composePostContent,
          {backgroundColor: theme.paper.colors.surface},
        ]}>
        <FlexableTextArea
          style={[styles.composePostText, textStyle]}
          onSubmit={(text) => savePostIfValid(text)}
        />
        <Text style={styles.instruction}>hit enter to send</Text>
      </View>
    );
  } else {
    return (
      <View
        onLayout={(e: LayoutChangeEvent) => {
          const value = e.nativeEvent.layout.height;
          height && height(value);
        }}
        style={[
          styles.composePostContent,
          {backgroundColor: theme.paper.colors.surface},
        ]}>
        <FlexableTextArea
          style={[styles.composePostText, textStyle]}
          placeholder={"What's happening?"}
          onSubmit={(text) => savePostIfValid(text)}
        />
        <Text style={styles.instruction}>hit enter to send</Text>
        <View style={styles.tagsRow}>
          <Tags
            style={[styles.flex, {borderRadius: theme.paper.roundness}]}
            value={tags}
            onTagsChanged={(tagIds) => setTags(tagIds)}
          />
          <PostPrivacy getValue={(p) => (privacy = p)} />
        </View>
      </View>
    );
  }
};

const PostUser = ({
  userId,
  navigationRef,
}: {
  userId: string;
  navigationRef: NavigationContainerRef | null;
}) => {
  const [rerun, setRerun] = React.useState(true);
  const {status, data, error, refetch} = useQuery<User>(userId, getUserById, {
    suspense: true,
  });
  const thumbnail =
    data !== false &&
    data !== undefined &&
    data.photoURL !== undefined &&
    data.photoURL.href
      ? data.photoURL.href
      : null;
  if (status === QueryStatus.Loading) {
    return <View />;
  } else if (status === QueryStatus.Error) {
    return <Text style={styles.errorText}>An error occured: {error}</Text>;
  } else if (data === false || data === undefined) {
    return <Text style={styles.errorText}>No user {userId} found</Text>;
  } else {
    if (rerun) {
      setRerun(false);
      refetch(); // I had to do this because I was always getting [], maybe becuse of caching an earlier request?
    }
    return (
      <View style={styles.postUser}>
        <TouchableHighlight
          onPress={() =>
            navigationRef?.navigate('Root', {
              screen: 'Profile',
              params: {userId: data.uid},
            })
          }>
          {thumbnail ? (
            <Avatar.Image
              onTouchEnd={() => {
                navigationRef?.navigate('Root', {
                  screen: 'Profile',
                  params: {userId: data.uid},
                });
              }}
              size={40}
              source={{uri: thumbnail}}
              style={styles.postUserImage}
            />
          ) : (
            <Text style={styles.postUserName}>
              {data.displayName !== null && data.displayName !== undefined
                ? ' ' + data.displayName
                : ''}
            </Text>
          )}
        </TouchableHighlight>
      </View>
    );
  }
};

const PostComponent = ({
  post,
  navigationRef,
  inset,
  onDeletePost,
}: {
  post: Post;
  navigationRef: NavigationContainerRef | null;
  inset: number;
  onDeletePost: (post: Post) => void;
}) => {
  const [theme, user] = useSelector((state: State) => [
    state.theme,
    state.user,
  ]);
  const [exposeComments, setExposeComments] = React.useState(false);
  const commentsInset = 12;
  const maxInset = 3;
  const createTwoButtonAlert = () => {
    if (Platform.OS === 'web') {
      // Alert doesn't seem to work in expo/web https://github.com/expo/expo/issues/6560
      onDeletePost(post);
    } else {
      Alert.alert(
        'Delete post',
        'Are you sure? This action is not reversable.',
        [
          {
            text: 'Cancel',
            //onPress: () => console.log("Cancel Pressed"),
            style: 'cancel',
          },
          {text: 'OK', onPress: () => onDeletePost(post)},
        ],
        {cancelable: true},
      );
    }
  };
  return (
    <View>
      <View
        style={[
          styles.postComponentContainer,
          {backgroundColor: theme.paper.colors.surface},
        ]}>
        <View style={styles.row}>
          <Text style={styles.postBody}>{post.body}</Text>
          <View style={styles.postMetadataContainer}>
            <React.Suspense fallback={<ActivityIndicator />}>
              <PostUser
                userId={post.created.by}
                navigationRef={navigationRef}
              />
            </React.Suspense>
            <Text style={styles.postMetadataText}>
              {post.criteria.privacy !== PostPrivacyTypes.PUBLIC &&
                (post.criteria.privacy === PostPrivacyTypes.FRIENDS
                  ? 'friends only'
                  : 'private')}
            </Text>
            <Text style={styles.postMetadataText}>
              {formatDateConditionally(post.created.on).replace(
                /(monday |tuesday |wednesday |thursday |friday |saturday |sunday )/i,
                '',
              )}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          {user && user.uid === post.created.by && (
            <View style={styles.row}>
              <MaterialCommunityIcons
                style={styles.firstIcon}
                name={'delete'}
                onPress={createTwoButtonAlert}
                color={theme.paper.colors.text}
                size={26}
              />
              <View
                style={[
                  styles.verticalDivider,
                  {
                    borderLeftWidth: StyleSheet.hairlineWidth,
                    borderLeftColor: theme.navigation.colors.border,
                  },
                ]}
              />
            </View>
          )}
          <MaterialCommunityIcons
            style={
              user && user.uid === post.created.by
                ? styles.secondIcon
                : styles.firstIcon
            }
            name={exposeComments ? 'comment' : 'comment-outline'}
            onPress={() =>
              exposeComments
                ? setExposeComments(false)
                : setExposeComments(true)
            }
            color={theme.paper.colors.text}
            size={26}
          />
          <View
            style={[
              styles.verticalDivider,
              {
                borderLeftWidth: StyleSheet.hairlineWidth,
                borderLeftColor: theme.navigation.colors.border,
              },
            ]}
          />
          <Tags value={post.tags} />
        </View>
      </View>
      {exposeComments && (
        <View
          style={[
            styles.comments,
            {
              paddingLeft:
                inset > maxInset ? 3 * commentsInset : inset * commentsInset,
            },
          ]}>
          <Posts
            showComposePost={true}
            navigationRef={navigationRef}
            criteria={{
              key: {
                id: post.key,
                type: 'comments',
              },
              privacy: PostPrivacyTypes.PUBLIC,
            }}
          />
        </View>
      )}
    </View>
  );
};

// https://react-query.tanstack.com/docs/guides/infinite-queries

const PostsList = ({
  criteria,
  showComposePost,
  navigationRef,
  inset,
}: {
  criteria: PostCriteria;
  showComposePost?: boolean;
  navigationRef: NavigationContainerRef | null;
  inset: number;
}) => {
  const [user] = useSelector((state: State) => [state.user]);
  const fetchPostsWithCustomParams = (
    col: string,
    crit: PostCriteria,
    cursor: number | undefined,
  ) => {
    return fetchPosts(user, crit, cursor);
  };
  const {
    status,
    data,
    isFetching,
    //isFetchingMore,
    //fetchMore,
    //canFetchMore,
    error,
  } = useInfiniteQuery<
    Array<Post>,
    Error,
    [string, PostCriteria, number | undefined]
  >(['posts', criteria], fetchPostsWithCustomParams, {suspense: true});
  const [mutateAdd] = useMutation((post: Post) => addPost(user, post), {
    onSuccess: (d) =>
      data &&
      data[0] &&
      queryCache.setQueryData(['posts', criteria], [d, ...data[0]]),
  });
  const [mutateDelete] = useMutation((post: Post) => deletePost(user, post), {
    onSuccess: (d, v) =>
      data &&
      data[0] &&
      queryCache.setQueryData(
        criteria,
        data[0].filter((p) => p.key !== v.key),
      ),
  });
  const savePost = (post: Post) => {
    mutateAdd(post);
  };
  const removePost = (post: Post) => {
    mutateDelete(post);
  };
  if (status === QueryStatus.Loading) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching posts: {error?.message}</Text>;
  } else {
    const posts: Array<Post> =
      data && data[0]
        ? showComposePost
          ? [emptyPost, ...data[0]]
          : data[0]
        : [];
    return (
      <SafeAreaView style={styles.flex}>
        <FlatList
          nestedScrollEnabled={true}
          windowSize={10}
          style={styles.flex}
          data={posts}
          renderItem={(p) =>
            p.item === emptyPost ? (
              <ComposePost
                criteria={criteria}
                onSavePost={(p2) => savePost(p2)}
              />
            ) : (
              <PostComponent
                inset={inset + 1}
                post={p.item}
                navigationRef={navigationRef}
                onDeletePost={(p2) => removePost(p2)}
              />
            )
          }
          keyExtractor={(p, i) => p.key}
          //onEndReached={fetchMore}
          refreshing={isFetching}
          onEndReachedThreshold={0.25}
        />
      </SafeAreaView>
    );
  }
};

type PostProps = {
  showComposePost?: boolean;
  criteria: PostCriteria;
  navigationRef: NavigationContainerRef | null;
  inset?: number;
};

const Posts = ({
  showComposePost,
  criteria,
  navigationRef,
  inset = 0,
}: PostProps) => {
  return (
    <View style={styles.container}>
      <React.Suspense fallback={<ActivityIndicator />}>
        <PostsList
          inset={inset}
          criteria={criteria}
          showComposePost={showComposePost === true}
          navigationRef={navigationRef}
        />
      </React.Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  comments: {
    paddingTop: 12,
  },
  firstIcon: {
    padding: 8,
    marginLeft: 12,
    alignSelf: 'center',
  },
  secondIcon: {
    padding: 8,
    alignSelf: 'center',
  },
  verticalDivider: {
    width: 0,
    marginHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
  },
  errorText: {
    color: 'red',
  },
  postUser: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: 8,
    minWidth: 70,
  },
  postUserImage: {
    backgroundColor: 'transparent',
  },
  postUserName: {
    fontSize: 10,
    maxWidth: 65,
  },
  container: {
    flex: 1,
  },
  composePostAnimatedContainer: {
    marginBottom: 12,
    elevation: 4,
    zIndex: 4,
  },
  composePostContent: {
    flex: 1,
    margin: 0,
  },
  instruction: {
    flex: 1,
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 12,
  },
  composePostText: {
    margin: 0,
    flex: 1,
    position: 'relative',
  },
  postComponentContainer: {
    marginTop: 12,
    paddingBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  postMetadataContainer: {
    alignContent: 'flex-end',
  },
  postMetadataText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    paddingRight: 8,
  },
  postBody: {
    padding: 12,
    flex: 1,
  },
  postPrivacyContainer: {
    paddingHorizontal: 12,
  },
  flex: {
    flex: 1,
  },
});

export default Posts;
