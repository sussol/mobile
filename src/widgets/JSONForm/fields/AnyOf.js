/* eslint-disable no-console */
import React from 'react';
import { Text, View } from 'react-native';

export const AnyOf = props => {
  console.log('-------------------------------------------');
  console.log('AnyOf - props', props);
  console.log('-------------------------------------------');
  return (
    <View style={{ borderWidth: 1, marginLeft: 10 }}>
      <Text>AnyOfField</Text>
    </View>
  );
};
