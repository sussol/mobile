/* eslint-disable no-console */
import React from 'react';
import { Text, View } from 'react-native';

export const OneOf = props => {
  console.log('-------------------------------------------');
  console.log('OneOf - props', props);
  console.log('-------------------------------------------');
  return (
    <View style={{ borderWidth: 1, marginLeft: 10 }}>
      <Text>OneOfField</Text>
    </View>
  );
};
