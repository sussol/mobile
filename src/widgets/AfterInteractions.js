import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native';
import { FlexView } from './FlexView';
import { SUSSOL_ORANGE } from '../globalStyles/index';
import { useAfterInteractions } from '../hooks/useAfterInteractions';

export const AfterInteractions = ({ children, placeholder }) => {
  const ready = useAfterInteractions();

  return ready ? (
    children
  ) : (
    <FlexView flex={1} justifyContent="center" alignItems="center">
      {placeholder}
    </FlexView>
  );
};

AfterInteractions.defaultProps = {
  placeholder: <ActivityIndicator size="large" color={SUSSOL_ORANGE} />,
};

AfterInteractions.propTypes = {
  placeholder: PropTypes.node,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
};
