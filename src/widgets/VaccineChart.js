/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';

import {
  VictoryLine,
  VictoryScatter,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';

import Svg from 'react-native-svg';

import { HazardPoint } from './HazardPoint';

/**
 * Plots a line graph of temperature over time for vaccines.
 */
export class VaccineChart extends React.Component {
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

  getDomain() {
    const { minLine, maxLine, minTemperature, maxTemperature, dataKeys } = this.props;
    const lines = [...minLine, ...maxLine];

    const { y: temperatureKey } = dataKeys;

    const minDomain =
      lines.reduce(
        (currentMinTemperature, sensorLog) =>
          Math.min(currentMinTemperature, sensorLog[temperatureKey]),
        minTemperature
      ) - 1;

    const maxDomain =
      lines.reduce(
        (currentMaxTemperature, sensorLog) =>
          Math.max(currentMaxTemperature, sensorLog[temperatureKey]),
        maxTemperature
      ) + 1;

    return { minDomain, maxDomain };
  }

  renderMinTemperatureBoundary() {
    const { minTemperature } = this.props;

    // minTemp default prop is Infinity.
    return minTemperature !== Infinity ? (
      <VictoryLine
        y={() => minTemperature}
        style={{
          data: { strokeDasharray: minLineStyles.strokeDasharray, stroke: minLineStyles.stroke },
        }}
      />
    ) : null;
  }

  renderMaxTemperatureBoundary() {
    const { maxTemperature } = this.props;

    // maxTemp default prop is -Infinity.
    return maxTemperature !== -Infinity ? (
      <VictoryLine
        y={() => maxTemperature}
        style={{
          data: { strokeDasharray: maxLineStyles.strokeDasharray, stroke: maxLineStyles.stroke },
        }}
      />
    ) : null;
  }

  renderMinLogTemperatureLine() {
    const { minLine, dataKeys } = this.props;

    if (!(minLine.length > 0)) return null;

    return (
      <VictoryLine
        data={minLine}
        interpolation={minLineStyles.interpolation}
        style={{ data: { stroke: minLineStyles.stroke } }}
        {...dataKeys}
      />
    );
  }

  renderMinLogTemperatureScatter() {
    const { minLine, dataKeys } = this.props;

    if (!(minLine.length > 0)) return null;

    return (
      <VictoryScatter data={minLine} style={{ data: { fill: minLineStyles.fill } }} {...dataKeys} />
    );
  }

  renderMaxLogTemperatureLine() {
    const { maxLine, dataKeys } = this.props;

    if (!(maxLine.length > 0)) return null;

    return (
      <VictoryLine
        data={maxLine}
        interpolation={maxLineStyles.interpolation}
        style={{ data: { stroke: maxLineStyles.stroke } }}
        {...dataKeys}
      />
    );
  }

  renderMaxLogTemperatureScatter() {
    const { maxLine, dataKeys } = this.props;

    if (!(maxLine.length > 0)) return null;

    return (
      <VictoryScatter data={maxLine} style={{ data: { fill: maxLineStyles.fill } }} {...dataKeys} />
    );
  }

  renderHazardPoints() {
    const { breaches, onPress, dataKeys } = this.props;

    if (!(breaches.length > 0)) return null;

    return breaches.map(breach => (
      <VictoryScatter
        dataComponent={<HazardPoint onPress={onPress} breach={breach} />}
        data={breach}
        {...dataKeys}
      />
    ));
  }

  renderPlot() {
    const { minLine, maxLine } = this.props;

    if (minLine.length + maxLine.length === 0) return null;

    const { width, height } = this.state;

    // First render will always return null due to sizing using onLayout.
    if (!width || !height) return null;

    const { minDomain, maxDomain } = this.getDomain();

    return (
      <Svg>
        <VictoryChart
          width={width}
          height={height}
          style={chartStyles}
          theme={VictoryTheme.material}
          maxDomain={{ y: maxDomain }}
          minDomain={{ y: minDomain }}
        >
          <VictoryAxis offsetY={50} /> <VictoryAxis dependentAxis offsetX={50} crossAxis={false} />
          {this.renderMinLogTemperatureLine()} {this.renderMinLogTemperatureScatter()}
          {this.renderMaxLogTemperatureLine()} {this.renderMaxLogTemperatureScatter()}
          {this.renderMinTemperatureBoundary()} {this.renderMaxTemperatureBoundary()}
          {this.renderHazardPoints()}
        </VictoryChart>
      </Svg>
    );
  }

  render() {
    return (
      // Svg wrapper fixes victory-native onPressIn bug on Android devices.
      <View style={{ width: '100%', height: '100%' }} onLayout={this.onLayout}>
        {this.renderPlot()}
      </View>
    );
  }
}

const chartStyles = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
};

const minLineStyles = {
  fill: 'blue',
  interpolation: 'natural',
  strokeDasharray: '1',
  stroke: 'blue',
};

const maxLineStyles = {
  fill: 'red',
  interpolation: 'natural',
  strokeDasharray: '1',
  stroke: 'red',
};

VaccineChart.propTypes = {
  minLine: PropTypes.arrayOf(PropTypes.object),
  maxLine: PropTypes.arrayOf(PropTypes.object),
  breaches: PropTypes.arrayOf(PropTypes.array),
  minTemperature: PropTypes.number,
  maxTemperature: PropTypes.number,
  onPress: PropTypes.func,
  dataKeys: PropTypes.objectOf(PropTypes.string),
};

VaccineChart.defaultProps = {
  minLine: [],
  maxLine: [],
  breaches: [],
  minTemperature: Infinity,
  maxTemperature: -Infinity,
  onPress: () => null,
  dataKeys: { x: 'timestamp', y: 'temperature' },
};

export default VaccineChart;
