/* eslint-disable no-console */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { View, Text } from 'react-native';

export const ObjectField = props => {
  console.log('-------------------------------------------');
  console.log('ObjectField - props', props);
  console.log('-------------------------------------------');
  return (
    <View style={{ marginLeft: 10, borderWidth: 1 }}>
      <Text>ObjectFieldTemplate</Text>
      {props.properties.map(element => element.content)}
    </View>
  );
};
