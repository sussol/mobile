/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Keyboard, TouchableWithoutFeedback } from 'react-native';

import globalStyles from '../globalStyles';

const { pageContentContainer, container } = globalStyles;

const dismiss = () => Keyboard.dismiss();
/**
 * Simple template container for a standard data table page.
 * Handles placement of content and wraps the page with a
 * Touchable, dismissing the keyboard when an event propogates
 * to this level.
 */
export const DataTablePageView = props => {
  const { children } = props;
  return (
    <TouchableWithoutFeedback onPress={dismiss}>
      <View style={pageContentContainer}>
        <View style={container}>{children}</View>
      </View>
    </TouchableWithoutFeedback>
  );
};

DataTablePageView.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default DataTablePageView;
