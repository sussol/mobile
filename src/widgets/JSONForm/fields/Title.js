/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { FormLabel } from '../../FormInputs/FormLabel';

import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../../globalStyles/fonts';

export const Title = props => {
  const { title, isRequired } = props;

  return title ? (
    <FormLabel textStyle={styles.textStyle} isRequired={isRequired} value={title} />
  ) : null;
};

const styles = StyleSheet.create({
  textStyle: {
    fontWeight: 'bold',
    fontSize: APP_GENERAL_FONT_SIZE,
    fontFamily: APP_FONT_FAMILY,
  },
});

Title.defaultProps = {
  title: '',
  isRequired: false,
};

Title.propTypes = {
  title: PropTypes.string,
  isRequired: PropTypes.bool,
};
