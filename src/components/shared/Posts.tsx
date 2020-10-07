import * as React from 'react';
import { View, StyleSheet, ViewStyle, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../../Types';
import { Post, PostCriteria, PostPrivacyTypes, getPostPrivacyName, PostsType } from '../../reducers/PostsReducer';
import { addPostWithDispatch, PostsSubject, PostsObserver } from '../../middleware/PostsMiddleware'
import Slider from '@react-native-community/slider';
import Tags from './Tags';
import FlexableTextArea from './FlexableTextArea';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDateConditionally } from '../../middleware/CalendarMiddleware';

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
  onSavePost: (post: Post) => void
}

const ComposePost = ({
  criteria,
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
      <View style={[styles.composePostContent, { backgroundColor: theme.paper.colors.surface }]}>
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
      <View style={[styles.composePostContent, { zIndex: 3, flexDirection:'column', backgroundColor: theme.paper.colors.surface }]}>
        <FlexableTextArea
          style={[styles.composePostText, textStyle]}
          onSubmit={text => savePostIfValid(text)} />
        <Text style={styles.instruction}>hit enter to send</Text>
      </View>
    )
  } else {
    return (
      <View style={[styles.composePostContent, { zIndex: 3, backgroundColor: theme.paper.colors.surface }]}>
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

const PostsList = ({
  postsSubject,
} : {
  postsSubject: PostsSubject,
}) => {
  const [posts, setPosts] = React.useState<PostsType>()
  const onPostsUpdated: PostsObserver = (postsType: PostsType) => {
    setPosts(postsType)
  }
  React.useEffect(() => {
    postsSubject.attach(onPostsUpdated)
    return () => postsSubject.detach(onPostsUpdated)
  }, [])
  if (!posts) {
    return <ActivityIndicator />
  } else {
    return (
      <SafeAreaView>
        <FlatList
          data={posts.items}
          renderItem={p => <PostComponent post={p.item} />}
          keyExtractor={(p,i) => p.key || 'post' + i}
          //onEndReached={retrieveMore}
          //refreshing={this.state.refreshing}
          //onEndReachedThreshold={0}
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
  const user = useSelector((state: State) => state.user)
  const dispatch = useDispatch()
  const savePost = (post: Post) => {
    dispatch(addPostWithDispatch(post))
  }
  const postsSubject = new PostsSubject(user, criteria)
  return (
    <View style={styles.container}>
      {showComposePost && <ComposePost criteria={criteria} onSavePost={p => savePost(p)} />}
      <PostsList postsSubject={postsSubject} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    
  },
  composePostContent: {
    marginBottom: 12,
  },
  instruction: {
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