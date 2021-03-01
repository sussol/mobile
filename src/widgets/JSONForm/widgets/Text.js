/* eslint-disable no-console */
import React from 'react';
import { Text as RNText, View, TextInput } from 'react-native';

export const Text = props => {
  console.log('-------------------------------------------');
  console.log('Text - props', props);
  console.log('-------------------------------------------');

  return (
    <View style={{ borderWidth: 1, marginLeft: 10 }}>
      <RNText>Text Widget</RNText>
      <TextInput
        onChangeText={text => {
          // eslint-disable-next-line react/prop-types
          props.onChange(text);
        }}
      />
    </View>
  );
};
