/* eslint-disable react/prop-types */
/* eslint-disable no-console */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { View, Text } from 'react-native';

export const ArrayField = props => {
  console.log('-------------------------------------------');
  console.log('ArrayField - props', props);
  console.log('-------------------------------------------');
  return (
    <View style={{ marginLeft: 10, borderWidth: 1 }}>
      <Text>ArrayFieldTemplate</Text>
      {props.children}
    </View>
  );
};
