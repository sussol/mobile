import React from 'react';
import { View } from 'react-native';

// eslint-disable-next-line import/prefer-default-export
export class ChartWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: null,
      height: null,
    };
  }

  // Victory Native sizes are set using absolute values. Parents dimensions are used to
  // calculate relative values for width and height for each chart.
  onLayout = event => {
    this.setState({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  // eslint-disable-next-line class-methods-use-this
  renderWrapper() {
    const { width, height } = this.state;
    // eslint-disable-next-line react/prop-types
    const { chartFunction } = this.props;

    if (!width || !height) return null;

    return chartFunction(width, height);
  }

  render() {
    return (
      <View style={{ width: '100%', height: '100%' }} onLayout={this.onLayout}>
        {this.renderWrapper()}
      </View>
    );
  }
}
