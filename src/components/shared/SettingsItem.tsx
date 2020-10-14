import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {Subheading, Switch} from 'react-native-paper';

type Props = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export default function SettingsItem({label, value, onValueChange}: Props) {
  return (
    <View style={styles.container}>
      <Subheading>{label}</Subheading>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
