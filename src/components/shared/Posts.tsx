import * as React from 'react';
import { View, StyleSheet, ViewStyle, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { State } from '../../Types';
import { ThemeState, Theme } from '../../reducers/ThemeReducer';
import { Post, PostsState, PostCriteria, PostPrivacy, getPostPrivacyName } from '../../reducers/PostsReducer';
import { addPostWithDispatch } from '../../middleware/PostsMiddleware'
import { TouchableHighlight } from 'react-native-gesture-handler';
import Slider from '@react-native-community/slider';
import Tags from './Tags';
import { Tag } from '../../reducers/TagsReducer';
import FlexableTextArea from './FlexableTextArea';
import { AuthState } from '../../reducers/AuthReducer';
import { SafeAreaView } from 'react-native-safe-area-context';

// used for a list of posts, for comments within a post, messages between users, and for searching maybe?

type ComposePostProps = {
  user: AuthState['user'],
  theme: Theme,
  criteria: PostCriteria,
  onSavePost: (post: Post) => void
}

export const ComposePost = connect((state: State) => ({ user: state.user, theme: state.theme }))(
({
  user,
  theme,
  criteria,
  onSavePost,
}: ComposePostProps) => {
  const textStyle: ViewStyle = {
    borderRadius: theme.paper.roundness,
    borderColor: theme.paper.colors.accent,
    backgroundColor: theme.paper.colors.onSurface,
  }
  if (!user) {
    return (
      <View style={styles.composePostContent}>
        <Text style={[styles.composePostText, textStyle]}>Please sign in</Text>
      </View>
    )
  }
  const [body, setBody] = React.useState('');
  const [tags, setTags] = React.useState(new Array<string>());
  const [privacy, setPrivacy] = React.useState(0 as PostPrivacy);
  return (
    <View style={styles.composePostContent}>
      <FlexableTextArea
        style={[styles.composePostText, textStyle]}
        value={body}
        placeholder="What's happening?"
        onChangeText={(text) => setBody(text)} />
      <View style={{flexDirection: 'row', flexWrap: 'nowrap'}}>
        <Tags style={{flexGrow: 1, borderRadius: theme.paper.roundness}}
          value={tags}
          onTagsChanged={(ts: Array<Tag>) => {
            console.log(ts.map(t => t.key as string))
            setTags(ts.map(t => t.key as string)) // using "as string" to tell typescript key won't be undefined at this point
          }} />
        <View style={{paddingLeft:8}}>
          <Text>{getPostPrivacyName(privacy)}</Text>
          <Slider
            style={{flex:1}}
            value={privacy}
            step={1}
            minimumValue={0}
            maximumValue={2}
            onValueChange={(s: number) => setPrivacy(s)}
            />
          <TouchableHighlight
            style={[styles.composePostButton, {borderRadius: theme.paper.roundness, backgroundColor: theme.paper.colors.accent}]}
            onPress={() => {
              const newPost: Post = {
                body,
                tags,
                criteria: {...criteria, privacy}
              }
              onSavePost(newPost)
              setBody('')
              setTags([])
            }}
          ><Text>{criteria.recipientId ? 'send' : 'post'}</Text></TouchableHighlight>
        </View>
      </View>
    </View>
  )
})

const PostComponent = ({
  post
} : {
  post: Post
}) => {
  return (
    <View>
      <Text>{post.body}</Text>
      <Tags value={post.tags} />
    </View>
  )
}

type PostProps = {
  showComposePost?: boolean,
  criteria: PostCriteria,
  theme: ThemeState['theme'],
  posts: PostsState['posts'],
  savePost: (post: Post) => void,
}

const Posts = ({
  showComposePost,
  criteria,
  theme,
  posts,
  savePost,
}: PostProps) => {
  return (
    <View style={styles.container}>
      {showComposePost && <ComposePost criteria={criteria} onSavePost={p => savePost(p)} />}
      <SafeAreaView>
        <FlatList
          data={posts.items}
          renderItem={p => <PostComponent post={p.item}/>}
          keyExtractor={(p,i) => p.key || 'post' + i}
          //onEndReached={retrieveMore}
          //refreshing={this.state.refreshing}
          //onEndReachedThreshold={0}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  composePostContent: {
    marginBottom: 12,
  },
  composePostButton: {
    padding:8,
  },
  composePostText: {
    margin: 0,
    flex: 1
  },
});

interface DispatchProps {
  savePost: (post: Post) => void
}

const mapStateToProps = (state: State) => {
  return {
    user: state.user,
    theme: state.theme,
    posts: state.posts,
  };
};
const mapDispatchToProps = (dispatch: ThunkDispatch<State, firebase.app.App, any>): DispatchProps => {
  return {
    savePost: (post: Post) => {
      dispatch(addPostWithDispatch(post))
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Posts);