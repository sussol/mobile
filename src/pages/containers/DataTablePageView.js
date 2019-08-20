import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { pageStyles } from '../../globalStyles';

const { newPageContentContainer, newContainer } = pageStyles;

/**
 * Simple container for a standard data table
 * page.
 */
const DataTablePageView = props => {
  const { children } = props;
  return (
    <View style={newPageContentContainer}>
      <View style={newContainer}>{children}</View>
    </View>
  );
};

DataTablePageView.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default DataTablePageView;
