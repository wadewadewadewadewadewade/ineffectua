import * as React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import FlexableTextArea from './FlexableTextArea';
import { State } from '../../Types';
import { connect } from 'react-redux';
import { AuthState } from '../../reducers/AuthReducer';
import { Text } from 'react-native-paper';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { Theme } from '../../reducers/ThemeReducer';
import Tags from './Tags';

type ComposePostProps = {
  user: AuthState['user'],
  theme: Theme,
  recipientId?: string
}

const ComposePost = ({
  user,
  theme,
  recipientId,
}: ComposePostProps) => {
  const textStyle: ViewStyle = {
    borderRadius: theme.paper.roundness,
    borderColor: theme.paper.colors.accent,
    backgroundColor: theme.paper.colors.onSurface,
  }
  if (!user) {
    return (
      <View style={styles.content}>
        <Text style={[styles.text, textStyle]}>Please sign in</Text>
      </View>
    )
  }
  const [description, setDescription] = React.useState('');
  return (
    <View style={styles.content}>
      <FlexableTextArea
        style={[styles.text, textStyle]}
        value={description}
        placeholder="What's happening?"
        onChangeText={(text) => setDescription(text)} />
      <View style={{flexDirection: 'row', flexWrap: 'nowrap'}}>
        <Tags style={{flexGrow: 1, borderRadius: theme.paper.roundness}} />
        <TouchableHighlight
          style={[styles.button, {borderRadius: theme.paper.roundness, backgroundColor: theme.paper.colors.accent}]}
          onPress={() => {
            // save post
          }}
        ><Text>{recipientId ? 'send' : 'post'}</Text></TouchableHighlight>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    padding:8,
  },
  text: {
    margin: 0,
    flex: 1
  },
});

const mapStateToProps = (state: State) => {
  // Redux Store --> Component
  return {
    user: state.user,
    theme: state.theme,
  };
};
export default connect(mapStateToProps)(ComposePost)