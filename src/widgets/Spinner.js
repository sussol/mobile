/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Animated, StyleSheet } from 'react-native';

export class Spinner extends React.Component {
  constructor(props) {
    super(props);
    this.progressAnimation = new Animated.Value(0);
    this.startSpinning = this.startSpinning.bind(this);
    this.stopSpinning = this.stopSpinning.bind(this);
  }

  componentDidMount() {
    this.startSpinning();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isSpinning) this.startSpinning();
    else this.stopSpinning();
  }

  startSpinning() {
    Animated.loop(
      Animated.timing(this.progressAnimation, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }

  stopSpinning() {
    this.progressAnimation.setValue(0);
  }

  render() {
    const { color } = this.props;

    const interpolatedRotateAnimation = this.progressAnimation.interpolate({
      inputRange: [0, 100],
      outputRange: ['0deg', '360deg'],
    });
    return (
      <Animated.View
        style={[
          localStyles.square,
          {
            backgroundColor: color,
            transform: [{ rotate: interpolatedRotateAnimation }],
          },
        ]}
      />
    );
  }
}

export default Spinner;

Spinner.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  isSpinning: PropTypes.bool,
  color: PropTypes.string,
};

Spinner.defaultProps = {
  isSpinning: true,
  color: '#B7B7B7',
};

const localStyles = StyleSheet.create({
  square: {
    width: 40,
    height: 40,
  },
});
