/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { FormLabel } from '../../FormInputs/FormLabel';

import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../../globalStyles/fonts';

export const Title = ({ title, isRequired, size }) =>
  title ? <FormLabel textStyle={styles[size]} isRequired={isRequired} value={title} /> : null;

const styles = StyleSheet.create({
  normal: {
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontSize: APP_GENERAL_FONT_SIZE,
    fontFamily: APP_FONT_FAMILY,
  },
  medium: {
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: APP_FONT_FAMILY,
  },
  large: {
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontSize: 22,
    fontFamily: APP_FONT_FAMILY,
  },
});

Title.defaultProps = {
  title: '',
  isRequired: false,
  size: 'normal',
};

Title.propTypes = {
  title: PropTypes.string,
  isRequired: PropTypes.bool,
  size: PropTypes.string,
};
