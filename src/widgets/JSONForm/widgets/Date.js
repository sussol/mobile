/* eslint-disable no-console */
import React from 'react';
import { Text } from 'react-native';

export const Date = props => {
  console.log('-------------------------------------------');
  console.log('Date - props', props);
  console.log('-------------------------------------------');
  return <Text style={{ borderWidth: 1, marginLeft: 10 }}>DateWidget</Text>;
};
