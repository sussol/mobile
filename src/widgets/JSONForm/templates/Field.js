/* eslint-disable react/prop-types */
/* eslint-disable no-console */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Text, View } from 'react-native';

export const Field = props => {
  console.log('-------------------------------------------');
  console.log('FieldTemplate - props', props);
  console.log('-------------------------------------------');

  return (
    <View style={{ borderWidth: 1 }}>
      <Text>FieldTemplate</Text>
      {props.children}
    </View>
  );
};
