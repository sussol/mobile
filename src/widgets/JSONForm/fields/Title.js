/* eslint-disable no-console */
import React from 'react';
import { Text, View } from 'react-native';

export const Title = props => {
  console.log('-------------------------------------------');
  console.log('Title Field - props', props);
  console.log('-------------------------------------------');
  return (
    <View style={{ borderWidth: 1, marginLeft: 10 }}>
      <Text>TitleField</Text>
    </View>
  );
};
