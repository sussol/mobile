const React = require('react');
const ReactNative = require('react-native');
const {
  Animated,
  StyleSheet,
  View,
} = ReactNative;

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

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSpinning) this.startSpinning();
    else this.stopSpinning();
  }

  startSpinning() {
    Animated.timing(
              this.progressAnimation,
              { toValue: 100, duration: 1000, useNativeDriver: true, shouldLoop: true })
            .start();
  }

  stopSpinning() {
    this.progressAnimation.setValue(0);
  }

  render() {
    const interpolatedRotateAnimation = this.progressAnimation.interpolate({
      inputRange: [0, 100],
      outputRange: ['0deg', '360deg'],
    });
    return (
      <Animated.View
        style={[
          localStyles.box,
          {
            backgroundColor: this.props.color,
            transform: [{ rotate: interpolatedRotateAnimation }],
          },
        ]}
      />
    );
  }
}

Spinner.propTypes = {
  isSpinning: React.PropTypes.bool,
  color: React.PropTypes.string,
};

Spinner.defaultProps = {
  isSpinning: true,
  color: '#B7B7B7',
};

const localStyles = StyleSheet.create({
  box: {
    width: 40,
    height: 40,
  },
});
