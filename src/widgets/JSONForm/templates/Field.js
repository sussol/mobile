/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet } from 'react-native';
import { FINALISED_RED } from '../../../globalStyles/colors';
import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../../globalStyles/fonts';
import { FormInvalidMessage } from '../../FormInputs/FormInvalidMessage';
import { Spacer } from '../../Spacer';

export const Field = ({ label, fields, required, rawErrors, description, children }) => {
  const { TitleField } = fields;

  const hasError = rawErrors?.length > 0;

  let InvalidMessage = null;
  if (hasError) {
    InvalidMessage = rawErrors?.map(error => (
      <FormInvalidMessage
        key={error}
        isValid={!hasError}
        message={error}
        textStyle={styles.invalidStyle}
      />
    ));
  }

  return (
    <>
      <TitleField title={label} isRequired={required} />
      {description}
      {children}
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

Field.defaultProps = {
  rawErrors: [],
};

Field.propTypes = {
  label: PropTypes.string.isRequired,
  fields: PropTypes.object.isRequired,
  required: PropTypes.bool.isRequired,
  rawErrors: PropTypes.array,
  description: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};
