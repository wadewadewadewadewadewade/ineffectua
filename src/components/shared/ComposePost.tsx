import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import FlexableTextArea from './FlexableTextArea';
import { State } from '../../Types';
import { connect } from 'react-redux';
import { AuthState } from '../../reducers/AuthReducer';
import { Text } from 'react-native-paper';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { Theme } from '../../reducers/ThemeReducer';

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
  if (!user) {
    return (
      <View style={styles.content}>
        <Text style={styles.text}>Please sign in</Text>
      </View>
    )
  }
  const [description, setDescription] = React.useState('');
  const [isOneLine, setIsOneLine] = React.useState(true);
  return (
    <View style={[styles.content, { flexDirection: isOneLine ? 'row' : 'column'}]}>
      <FlexableTextArea
        style={{flex:1}}
        value={description}
        placeholder="What's happening?"
        onChangeLines={(lines) => {
          if (isOneLine && lines > 1) {
            setIsOneLine(false)
          } else if (!isOneLine && lines === 1) {
            setIsOneLine(true)
          }
        }}
        onChangeText={(text) => setDescription(text)} />
      <TouchableHighlight
        style={[styles.button, {borderRadius: theme.paper.roundness, backgroundColor: theme.paper.colors.accent}]}
        onPress={() => {
          // save post
        }}
      ><Text>{recipientId ? 'send' : 'post'}</Text></TouchableHighlight>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    marginLeft: 8,
    padding:8,
  },
  text: {
    textAlign: 'center',
    margin: 8,
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