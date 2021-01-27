/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { Fragment } from 'react';
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
export const DataTablePageView = React.memo(({ children, captureUncaughtGestures }) => {
  // Use a Fragment over TouchableWithoutFeedback so no gesture events are caught.
  // Fragment over a view as TouchableWithoutFeedback does not have implicit styling, a View does.
  const Container = captureUncaughtGestures ? TouchableWithoutFeedback : Fragment;

  // Fragments can only have key or children props
  const containerProps = captureUncaughtGestures ? { onPress: dismiss } : {};

  return (
    <Container {...containerProps}>
      <View style={pageContentContainer}>
        <View style={container}>{children}</View>
      </View>
    </Container>
  );
});

DataTablePageView.defaultProps = {
  captureUncaughtGestures: true,
};

DataTablePageView.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  captureUncaughtGestures: PropTypes.bool,
};

export default DataTablePageView;
