import * as React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  FlatList,
  Platform,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import {Text, ActivityIndicator, Avatar} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {State} from '../../Types';
import {
  Post,
  PostCriteria,
  PostPrivacyTypes,
  getPostPrivacyName,
} from '../../reducers/PostsReducer';
import {
  addPostWithDispatch,
  fetchPosts,
} from '../../middleware/PostsMiddleware';
import Slider from '@react-native-community/slider';
import Tags from './Tags';
import FlexableTextArea from './FlexableTextArea';
import {SafeAreaView} from 'react-native-safe-area-context';
import {formatDateConditionally} from '../../middleware/CalendarMiddleware';
import {useInfiniteQuery, QueryStatus, useQuery} from 'react-query';
import {User} from '../../reducers/AuthReducer';
import {getUserById} from '../../middleware/AuthMiddleware';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {NavigationContainerRef} from '@react-navigation/native';

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
  const isMessage = criteria.recipientId !== undefined;
  let privacy = PostPrivacyTypes.PUBLIC;
  const savePostIfValid = (body: string) => {
    if (/[^\s]+/.test(body)) {
      const newPost: Post = {
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
  const {status, data, error} = useQuery<User, Error>(userId, getUserById, {
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
    return (
      <View style={styles.postUser}>
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
          <TouchableHighlight
            onPress={() =>
              navigationRef?.navigate('Root', {
                screen: 'Profile',
                params: {userId: data.uid},
              })
            }>
            <Text style={styles.postUserName}>
              {data.displayName !== null && data.displayName !== undefined
                ? ' ' + data.displayName
                : ''}
            </Text>
          </TouchableHighlight>
        )}
      </View>
    );
  }
};

const PostComponent = ({
  post,
  navigationRef,
}: {
  post: Post;
  navigationRef: NavigationContainerRef | null;
}) => {
  const theme = useSelector((state: State) => state.theme);
  return (
    <View
      style={[
        styles.postComponentContainer,
        {backgroundColor: theme.paper.colors.surface},
      ]}>
      <View style={styles.row}>
        <Text style={styles.postBody}>{post.body}</Text>
        <View style={styles.postMetadataContainer}>
          <React.Suspense fallback={<ActivityIndicator />}>
            <PostUser userId={post.created.by} navigationRef={navigationRef} />
          </React.Suspense>
          <Text style={styles.postMetadataText}>
            {post.criteria.privacy !== PostPrivacyTypes.PUBLIC &&
              (post.criteria.privacy === PostPrivacyTypes.FRIENDS
                ? ' friends only'
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
      <Tags value={post.tags} />
    </View>
  );
};

enum ScrollDirections {
  UP,
  DOWN,
}

// https://react-query.tanstack.com/docs/guides/infinite-queries

const PostsList = ({
  criteria,
  onScroll,
  navigationRef,
}: {
  criteria: PostCriteria;
  onScroll?: (direction: ScrollDirections) => void;
  navigationRef: NavigationContainerRef | null;
}) => {
  const [user] = useSelector((state: State) => [state.user]);
  const fetchPostsWithCustomParams = (
    key: PostCriteria,
    cursor: number | undefined,
  ) => {
    return fetchPosts(user, key, cursor);
  };
  const {
    status,
    data,
    isFetching,
    //isFetchingMore,
    //fetchMore,
    //canFetchMore,
    error,
  } = useInfiniteQuery<Array<Post>, Error, [PostCriteria, number | undefined]>(
    JSON.stringify(criteria),
    fetchPostsWithCustomParams,
    {suspense: true},
  );
  if (status === QueryStatus.Loading) {
    return <ActivityIndicator />;
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching posts: {error?.message}</Text>;
  } else {
    const scroll = {
      offset: 0,
      direction: ScrollDirections.UP,
    };
    const posts: Array<Post> = data ? data[0] : [];
    return (
      <SafeAreaView style={styles.flex}>
        <FlatList
          data={posts}
          renderItem={(p) => (
            <PostComponent post={p.item} navigationRef={navigationRef} />
          )}
          keyExtractor={(p, i) => p.key || 'post' + i}
          onScroll={(e) => {
            if (onScroll) {
              const offset = e.nativeEvent.contentOffset.y;
              const direction =
                offset - scroll.offset > 0
                  ? ScrollDirections.DOWN
                  : ScrollDirections.UP;
              scroll.offset = e.nativeEvent.contentOffset.y;
              if (
                direction !== scroll.direction &&
                ((offset > 0 && direction === ScrollDirections.DOWN) ||
                  (offset === 0 && direction === ScrollDirections.UP))
              ) {
                scroll.direction = direction;
                onScroll(direction);
              }
            }
          }}
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
};

const Posts = ({showComposePost, criteria, navigationRef}: PostProps) => {
  const dispatch = useDispatch();
  const savePost = (post: Post) => {
    dispatch(addPostWithDispatch(post));
  };
  const [direction, setDirection] = React.useState(ScrollDirections.UP);
  let composePostHeight = 181;
  const height = new Animated.Value(0);
  const translateY = height.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      0,
      -0.25 * composePostHeight,
      -0.5 * composePostHeight,
      -0.75 * composePostHeight,
      -1 * composePostHeight,
    ],
  });
  React.useEffect(() => {
    const toValue = direction === ScrollDirections.UP ? 0 : 1;
    const animated = Animated.timing(height, {
      toValue,
      easing: Easing.elastic(1),
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    });
    animated.start();
    return () => animated.stop();
  }, [direction]);
  const animateComposePost = (d: ScrollDirections) => {
    // https://snack.expo.io/@xcarpentier/animation-example
    if (d !== direction) {
      setDirection(d);
    }
  };
  if (showComposePost) {
    return (
      <View style={styles.container}>
        <React.Suspense fallback={<ActivityIndicator />}>
          <Animated.View
            style={[
              styles.composePostAnimatedContainer,
              {transform: [{translateY}]},
            ]}>
            <ComposePost
              criteria={criteria}
              height={(h) => (composePostHeight = h)}
              onSavePost={(p) => savePost(p)}
            />
          </Animated.View>
          <Animated.View style={[styles.flex, {marginTop: translateY}]}>
            <PostsList
              criteria={criteria}
              onScroll={(d) => animateComposePost(d)}
              navigationRef={navigationRef}
            />
          </Animated.View>
        </React.Suspense>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <PostsList criteria={criteria} navigationRef={navigationRef} />
      </View>
    );
  }
};

const styles = StyleSheet.create({
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
    overflow: 'hidden',
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
