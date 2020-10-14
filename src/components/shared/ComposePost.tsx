import * as React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import FlexableTextArea from './FlexableTextArea';
import {State} from '../../Types';
import {useSelector} from 'react-redux';
import {Text} from 'react-native-paper';
import {TouchableHighlight} from 'react-native-gesture-handler';
import Tags from './Tags';

type ComposePostProps = {
  recipientId?: string;
};

const ComposePost = ({recipientId}: ComposePostProps) => {
  const [user, theme] = useSelector((state: State) => [
    state.user,
    state.theme,
  ]);
  const textStyle: ViewStyle = {
    borderRadius: theme.paper.roundness,
    borderColor: theme.paper.colors.accent,
    backgroundColor: theme.paper.colors.onSurface,
  };
  const [description, setDescription] = React.useState('');
  if (!user) {
    return (
      <View style={styles.content}>
        <Text style={[styles.text, textStyle]}>Please sign in</Text>
      </View>
    );
  }
  return (
    <View style={styles.content}>
      <FlexableTextArea
        style={[styles.text, textStyle]}
        value={description}
        placeholder="What's happening?"
        onChangeText={(text) => setDescription(text)}
      />
      <View style={styles.tagRow}>
        <Tags style={[styles.flex, {borderRadius: theme.paper.roundness}]} />
        <TouchableHighlight
          style={[
            styles.button,
            {
              borderRadius: theme.paper.roundness,
              backgroundColor: theme.paper.colors.accent,
            },
          ]}
          onPress={() => {
            // save post
          }}>
          <Text>{recipientId ? 'send' : 'post'}</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flex: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
  },
  button: {
    padding: 8,
  },
  text: {
    margin: 0,
    flex: 1,
  },
});

export default ComposePost;
