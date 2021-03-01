/* eslint-disable react/prop-types */
/* eslint-disable no-console */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Text, View } from 'react-native';

export const Field = props => {
  console.log('-------------------------------------------');
  console.log('FieldTemplate - props', props);
  console.log('-------------------------------------------');

  const { title, fields } = props;
  const { TitleField } = fields;

  return (
    <View style={{ borderWidth: 1 }}>
      <Text>FieldTemplate</Text>
      <TitleField title={title} />
      {props.description}
      {props.children}
    </View>
  );
};
