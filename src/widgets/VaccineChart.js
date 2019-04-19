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
    const { minLine, maxLine, minTemperature, maxTemperature } = this.props;
    const lines = [...minLine, ...maxLine];

    const minDomain =
      lines.reduce(
        (reducedTemperature, { temperature }) => Math.min(reducedTemperature, temperature),
        minTemperature
      ) - 1;

    const maxDomain =
      lines.reduce(
        (reducedTemperature, { temperature }) => Math.max(reducedTemperature, temperature),
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

  renderMinLogTemperatures() {
    const { minLine, dataKeys } = this.props;

    if (!(minLine.length > 0)) return null;

    return (
      <View>
        <VictoryLine
          data={minLine}
          interpolation={minLineStyles.interpolation}
          style={{ data: { stroke: minLineStyles.stroke } }}
          {...dataKeys}
        />
        <VictoryScatter
          data={minLine}
          style={{ data: { fill: minLineStyles.fill } }}
          {...dataKeys}
        />
      </View>
    );
  }

  renderMaxLogTemperatures() {
    const { maxLine, dataKeys } = this.props;

    if (!(maxLine.length > 0)) return null;

    return (
      <View>
        <VictoryLine
          data={maxLine}
          interpolation={maxLineStyles.interpolation}
          style={{ data: { stroke: maxLineStyles.stroke } }}
          {...dataKeys}
        />
        <VictoryScatter
          data={maxLine}
          style={{ data: { fill: maxLineStyles.fill } }}
          {...dataKeys}
        />
      </View>
    );
  }

  renderHazardPoints() {
    const { hazards, dataKeys } = this.props;

    return hazards.length > 0 ? (
      <VictoryScatter dataComponent={<HazardPoint />} data={hazards} {...dataKeys} />
    ) : null;
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
          <VictoryAxis offsetY={50} />
          <VictoryAxis dependentAxis offsetX={50} crossAxis={false} />
          {this.renderMinTemperatureBoundary()}
          {this.renderMaxTemperatureBoundary()}
          {this.renderMinLogTemperatures()}
          {this.renderMaxLogTemperatures()}
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
  hazards: PropTypes.arrayOf(PropTypes.object),
  minTemperature: PropTypes.number,
  maxTemperature: PropTypes.number,
  dataKeys: PropTypes.objectOf(),
};

VaccineChart.defaultProps = {
  minLine: [],
  maxLine: [],
  hazards: [],
  minTemperature: Infinity,
  maxTemperature: -Infinity,
  dataKeys: { x: 'timestamp', y: 'temperature' },
};

export default VaccineChart;
