/* eslint-disable no-console */
import React from 'react';
import { Text } from 'react-native';

export const Checkbox = props => {
  console.log('-------------------------------------------');
  console.log('Checkbox - props', props);
  console.log('-------------------------------------------');
  return <Text style={{ borderWidth: 1, marginLeft: 10 }}>CheckboxWidget</Text>;
};
