/* eslint-disable react/prop-types */
/* eslint-disable no-console */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { StyleSheet } from 'react-native';
import { FINALISED_RED } from '../../../globalStyles/colors';
import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../../globalStyles/fonts';
import { FormInvalidMessage } from '../../FormInputs/FormInvalidMessage';
import { Spacer } from '../../Spacer';

export const Field = props => {
  const { label, fields, required, rawErrors } = props;
  const { TitleField } = fields;

  const hasError = rawErrors?.length > 0;

  let InvalidMessage = null;
  if (hasError) {
    InvalidMessage = rawErrors?.map(error => (
      <FormInvalidMessage isValid={!hasError} message={error} textStyle={styles.invalidStyle} />
    ));
  }

  return (
    <>
      <TitleField title={label} isRequired={required} />
      {props.description}
      {props.children}
      {InvalidMessage}
      <Spacer space={20} vertical />
    </>
  );
};

const styles = StyleSheet.create({
  invalidStyle: {
    color: FINALISED_RED,
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
  },
});
