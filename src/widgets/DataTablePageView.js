/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { newPageStyles } from '../globalStyles';

const { pageContentContainer, container } = newPageStyles;

/**
 * Simple container for a standard data table page.
 */
export const DataTablePageView = props => {
  const { children } = props;
  return (
    <View style={pageContentContainer}>
      <View style={container}>{children}</View>
    </View>
  );
};

DataTablePageView.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default DataTablePageView;
