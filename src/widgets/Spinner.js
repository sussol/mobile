const React = require('react');
const ReactNative = require('react-native');
const {
  Animated,
  Text,
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

  startSpinning(toValue = 100) {
    Animated.timing(
              this.progressAnimation,
              { toValue: toValue, duration: 60000, useNativeDriver: true })
            .start((event) => { if (event.finished) this.startSpinning(toValue ? 0 : 100); });
  }

  stopSpinning() {
    this.progressAnimation.setValue(0);
  }

  render() {
    return (
      <Animated.View style={{ transform: [{ translateY: this.progressAnimation }] }}>
        <Text>LOADING...</Text>
      </Animated.View>
    );
  }
}

Spinner.propTypes = {
  isSpinning: React.PropTypes.bool,
};
