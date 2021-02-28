import React from 'react';
import { TextInput } from 'react-native';

export const Text = props => {
  console.log('-------------------------------------------');
  console.log('Text - props', props);
  console.log('-------------------------------------------');

  return (
    <TextInput
      onChangeText={text => {
        // eslint-disable-next-line react/prop-types
        props.onChange(text);
      }}
    />
  );
};
