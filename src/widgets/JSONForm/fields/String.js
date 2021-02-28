/* eslint-disable no-console */
import React from 'react';
import { Text, View } from 'react-native';

export const String = props => {
  console.log('-------------------------------------------');
  console.log('String - props', props);
  console.log('-------------------------------------------');
  return (
    <View style={{ borderWidth: 1, marginLeft: 10 }}>
      <Text>StringField</Text>
    </View>
  );
};
