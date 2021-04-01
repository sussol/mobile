/* eslint-disable no-console */
import React from 'react';
import { Text } from 'react-native';

export const Radio = props => {
  console.log('-------------------------------------------');
  console.log('Radio - props', props);
  console.log('-------------------------------------------');
  return <Text style={{ borderWidth: 1, marginLeft: 10 }}>RadioWidget</Text>;
};
