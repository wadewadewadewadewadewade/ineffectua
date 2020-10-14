import React from 'react';
import {StyleSheet, View, ViewStyle, StyleProp} from 'react-native';
import {Theme} from '../../reducers/ThemeReducer';
import {TextInput} from 'react-native-paper';
import {connect} from 'react-redux';
import {State} from '../../Types';

type FlexableTextAreaProps = {
  theme: Theme;
  value?: string;
  onChangeText?: ((text: string) => void) & Function;
  onChangeLines?: ((lines: number) => void) & Function;
  onSubmit?: ((text: string) => void) & Function;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

const FlexableTextArea = ({
  theme,
  value,
  onChangeText,
  onChangeLines,
  onSubmit,
  placeholder = 'Optional Description',
  style,
}: FlexableTextAreaProps) => {
  const [height, setHeight] = React.useState(1);
  const [body, setBody] = React.useState(value || '');
  return (
    <View style={style}>
      <TextInput
        style={[
          styles.description,
          {backgroundColor: theme.paper.colors.surface},
        ]}
        multiline={true}
        value={body}
        onContentSizeChange={(e) => {
          const newHeight = Math.floor(
            e.nativeEvent.contentSize.height / styles.description.lineHeight,
          );
          if (newHeight !== height) {
            setHeight(newHeight);
            if (onChangeLines !== undefined) {
              onChangeLines(newHeight);
            }
          }
        }}
        onKeyPress={(e) => {
          if (e.nativeEvent.key.toLowerCase() === 'enter') {
            e.preventDefault();
            const text = body;
            setBody('');
            onSubmit && onSubmit(text);
          }
        }}
        numberOfLines={height}
        onChangeText={(text) => {
          setBody(text);
          onChangeText && onChangeText(body);
        }}
        placeholder={placeholder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  description: {
    fontSize: 16,
    lineHeight: 22,
    padding: 3,
    minHeight: 0,
  },
});

const mapStateToProps = (state: State) => {
  return {
    theme: state.theme,
  };
};
export default connect(mapStateToProps)(FlexableTextArea);
