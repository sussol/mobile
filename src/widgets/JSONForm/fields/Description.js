import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../../globalStyles/fonts';

import { FormLabel } from '../../FormInputs/FormLabel';

export const Description = props => {
  const { description } = props;

  return description ? <FormLabel textStyle={styles.textStyle} value={description} /> : null;
};

const styles = StyleSheet.create({
  textStyle: {
    fontSize: APP_GENERAL_FONT_SIZE,
    fontFamily: APP_FONT_FAMILY,
  },
});

Description.defaultProps = {
  description: '',
};

Description.propTypes = {
  description: PropTypes.string,
};
