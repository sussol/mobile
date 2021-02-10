/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import { useConditionalAnimationRef } from '../hooks/index';
import { MILLISECONDS } from '../utilities/index';

export const WithFlash = ({ children, condition, style }) => {
  const ref = useConditionalAnimationRef(condition, 'flash', MILLISECONDS.ONE_SECOND);

  return (
    <Animatable.View iterationCount="infinite" animation="flash" style={style} ref={ref}>
      {children}
    </Animatable.View>
  );
};

WithFlash.defaultProps = {
  style: {},
};

WithFlash.propTypes = {
  children: PropTypes.node.isRequired,
  condition: PropTypes.bool.isRequired,
  style: PropTypes.object,
};
