/* eslint-disable no-console */
import React from 'react';
import { Text } from 'react-native';

export const Select = props => {
  console.log('-------------------------------------------');
  console.log('Select - props', props);
  console.log('-------------------------------------------');
  return <Text style={{ borderWidth: 1, marginLeft: 10 }}>SelectWidget</Text>;
};
