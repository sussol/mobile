import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { BLUE_WHITE } from '../../globalStyles';

export const TabContainer = ({ children }) => <View style={localStyles.container}>{children}</View>;

TabContainer.propTypes = { children: PropTypes.node.isRequired };

const localStyles = {
  container: { padding: 50, flex: 1, backgroundColor: BLUE_WHITE },
};
