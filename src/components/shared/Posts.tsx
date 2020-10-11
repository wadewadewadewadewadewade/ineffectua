import * as React from 'react';
import { View, StyleSheet, ViewStyle, FlatList, Platform, Animated, Easing, LayoutChangeEvent } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../Types';
import { Post, PostCriteria, PostPrivacyTypes, getPostPrivacyName } from '../../reducers/PostsReducer';
import { addPostWithDispatch, fetchPosts } from '../../middleware/PostsMiddleware'
import Slider from '@react-native-community/slider';
import Tags from './Tags';
import FlexableTextArea from './FlexableTextArea';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDateConditionally } from '../../middleware/CalendarMiddleware';
import { useInfiniteQuery, QueryStatus } from 'react-query'

// used for a list of posts, for comments within a post, messages between users, and for searching maybe?

const PostPrivacy = ({
  getValue,
} : {
  getValue: (privacy: PostPrivacyTypes) => void
}) => {
  const [privacy, setPrivacy] = React.useState(0 as PostPrivacyTypes);
  return (
    <View style={{paddingHorizontal:12}}>
      <Text>{getPostPrivacyName(privacy)}</Text>
      <Slider
        style={{flex:1}}
        value={privacy}
        step={1}
        minimumValue={0}
        maximumValue={2}
        onValueChange={(s: number) => { setPrivacy(s); getValue(s) }}
        />
    </View>
  )
}

type ComposePostProps = {
  criteria: PostCriteria,
  height?: (componentHeight: number) => void,
  onSavePost: (post: Post) => void
}

const ComposePost = ({
  criteria,
  height,
  onSavePost,
}: ComposePostProps) => {
  const [user, theme] = useSelector((state: State) => ([state.user, state.theme]))
  const textStyle: ViewStyle = {
    borderRadius: theme.paper.roundness,
    borderColor: theme.paper.colors.accent,
    backgroundColor: theme.paper.colors.onSurface,
  }
  if (!user) {
    return (
      <View
        onLayout={(e: LayoutChangeEvent) => {
          const value = e.nativeEvent.layout.height
          height && height(value)
        }}
        style={[styles.composePostContent, { backgroundColor: theme.paper.colors.surface }]}
      >
        <Text style={[styles.composePostText, textStyle]}>Please sign in</Text>
      </View>
    )
  }
  const [tags, setTags] = React.useState(new Array<string>());
  const isMessage = criteria.recipientId !== undefined
  let privacy = PostPrivacyTypes.PUBLIC
  const savePostIfValid = (body: string) => {
    if (/[^\s]+/.test(body)) {
      const newPost: Post = {
        body,
        tags,
        criteria: {...criteria, privacy},
        created: {
          by: user.uid,
          on: new Date(),
        }
      }
      onSavePost(newPost)
      tags.length > 0 && setTags([])
    }
  }
  if (isMessage) {
    return (
      <View
        onLayout={(e: LayoutChangeEvent) => {
          const value = e.nativeEvent.layout.height
          height && height(value)
        }}
        style={[styles.composePostContent, { zIndex: 3, flexDirection:'column', backgroundColor: theme.paper.colors.surface }]}
      >
        <FlexableTextArea
          style={[styles.composePostText, textStyle]}
          onSubmit={text => savePostIfValid(text)} />
        <Text style={styles.instruction}>hit enter to send</Text>
      </View>
    )
  } else {
    return (
      <View
        onLayout={(e: LayoutChangeEvent) => {
          const value = e.nativeEvent.layout.height
          height && height(value)
        }}
        style={[styles.composePostContent, { zIndex: 3, backgroundColor: theme.paper.colors.surface }]}
      >
        <FlexableTextArea
          style={[styles.composePostText, textStyle]}
          placeholder={'What\'s happening?'}
          onSubmit={text => savePostIfValid(text)} />
        <Text style={styles.instruction}>hit enter to send</Text>
        <View style={{flexDirection: 'row', flexWrap: 'nowrap'}}>
          <Tags style={{flexGrow: 1, borderRadius: theme.paper.roundness}}
            value={tags}
            onTagsChanged={tagIds => setTags(tagIds)} />
          <PostPrivacy getValue={p => privacy = p} />
        </View>
      </View>
    )
  }
}

const PostComponent = ({
  post,
} : {
  post: Post,
}) => {
  const theme = useSelector((state: State) => state.theme)
  return (
    <View style={{marginTop: 12, paddingBottom: 12, backgroundColor: theme.paper.colors.surface}}>
      <Text style={styles.postmetadata}>{formatDateConditionally(post.created.on)}</Text>
      <Text style={{ padding: 12 }}>{post.body}</Text>
      <Tags value={post.tags} />
    </View>
  )
}

enum ScrollDirections {
  UP,
  DOWN,
}

// https://react-query.tanstack.com/docs/guides/infinite-queries

const PostsList = ({
  criteria,
  onScroll
} : {
  criteria: PostCriteria,
  onScroll?: (direction: ScrollDirections) => void
}) => {
  const [user] = useSelector((state: State) => ([state.user]))
  const {
    status,
    data,
    isFetching,
    //isFetchingMore,
    fetchMore,
    //canFetchMore,
    error,
  } = useInfiniteQuery<Array<Post>, Error, [firebase.User, PostCriteria, (number | undefined)?]>(
    'posts',
    (cursor: number) => fetchPosts(user, criteria, cursor),
  )
  if (status === QueryStatus.Loading) {
    return <ActivityIndicator />
  } else if (status === QueryStatus.Error) {
    return <Text>An error occured while fetching posts: {error?.message}</Text>
  } else {
    const scroll = {
      offset: 0,
      direction: ScrollDirections.UP,
    }
    const posts: Array<Post> = data ? data[0] : []
    return (
      <SafeAreaView style={{flex:1}}>
        <FlatList
          data={posts}
          renderItem={p => <PostComponent post={p.item} />}
          keyExtractor={(p,i) => p.key || 'post' + i}
          onScroll={e => {
            if (onScroll) {
              const offset = e.nativeEvent.contentOffset.y
              const direction = offset - scroll.offset > 0 ?
                ScrollDirections.DOWN : ScrollDirections.UP
              scroll.offset = e.nativeEvent.contentOffset.y
              if (direction !== scroll.direction && ((offset > 0 && direction === ScrollDirections.DOWN) || (offset === 0 && direction === ScrollDirections.UP))) {
                scroll.direction = direction
                onScroll(direction)
              }
            }
          }}
          onEndReached={fetchMore}
          refreshing={isFetching}
          onEndReachedThreshold={0.25}
        />
      </SafeAreaView>
    )
  }
}

type PostProps = {
  showComposePost?: boolean,
  criteria: PostCriteria,
}

const Posts = ({
  showComposePost,
  criteria
}: PostProps) => {
  const dispatch = useDispatch()
  const savePost = (post: Post) => {
    dispatch(addPostWithDispatch(post))
  }
  if (showComposePost) {
    const height = new Animated.Value(0)
    let composePostHeight = 181
    const [direction, setDirection] = React.useState(ScrollDirections.UP)
    const translateY = height.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [0, -0.25 * composePostHeight, -0.5 * composePostHeight, -0.75 * composePostHeight, -1 * composePostHeight],
    })
    React.useEffect(() => {
      const toValue = direction === ScrollDirections.UP ? 0 : 1
      const animated = Animated.timing(height,{
        toValue,
        easing: Easing.elastic(1),
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      })
      animated.start()
      return () => animated.stop()
    }, [direction])
    const animateComposePost = (d: ScrollDirections) => { // https://snack.expo.io/@xcarpentier/animation-example
      if (d !== direction) {
        setDirection(d)
      }
    }
    return (
      <View style={styles.container}>
        <Animated.View
          style={[styles.composePostAnimatedContainer, {transform:[{translateY}]}]}
        >
          <ComposePost criteria={criteria} height={h => composePostHeight = h} onSavePost={p => savePost(p)} />
        </Animated.View>
        <Animated.View style={{flex: 1, marginTop: translateY}}>
          <PostsList criteria={criteria} onScroll={d => animateComposePost(d)} />
        </Animated.View>
      </View>
    )
  } else {
    return (
      <View style={styles.container}>
        <PostsList criteria={criteria} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  composePostAnimatedContainer: {
    marginBottom: 12,
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
    zIndex: 2,
    elevation: 2,
  },
  postmetadata: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    paddingRight: 8,
  },
});

export default Posts;