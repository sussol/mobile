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

import { APP_FONT_FAMILY } from '../globalStyles';

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
      width: event.nativeEvent.layout.width * 1,
      height: event.nativeEvent.layout.height * 1.025,
    });
  };

  renderPlot() {
    const { minLine, maxLine, hazards, minTemp, maxTemp } = this.props;
    const { width, height } = this.state;

    if (!width || !height) return null;

    if (minLine.length + maxLine.length === 0) return null;

    const dataKeys = { x: 'date', y: 'temp' };

    const lines = [...minLine, ...maxLine];

    const minDomain =
      lines.reduce((reducedTemp, { temp }) => Math.min(reducedTemp, temp), minTemp) - 1;
    const maxDomain =
      lines.reduce((reducedTemp, { temp }) => Math.max(reducedTemp, temp), maxTemp) + 1;

    const minTempPlotLine =
      // minTemp default prop is Infinity.
      minTemp !== Infinity ? (
        <VictoryLine
          y={() => minTemp}
          style={{
            data: { opacity: 0.3, stroke: minLineStyles.stroke },
          }}
        />
      ) : null;

    const maxTempPlotLine =
      // maxTemp default prop is -Infinity.
      maxTemp !== -Infinity ? (
        <VictoryLine
          y={() => maxTemp}
          style={{
            data: { opacity: 0.3, stroke: maxLineStyles.stroke },
          }}
        />
      ) : null;

    const minLinePlotLine =
      minLine.length > 0 ? (
        <VictoryLine
          data={minLine}
          interpolation={minLineStyles.interpolation}
          style={{ data: { stroke: minLineStyles.stroke } }}
          {...dataKeys}
        />
      ) : null;

    const minLinePlotScatter =
      minLine.length > 0 ? (
        <VictoryScatter
          data={minLine}
          size={3}
          style={{ data: { fill: 'white', stroke: minLineStyles.stroke, strokeWidth: 2 } }}
          {...dataKeys}
        />
      ) : null;

    const maxLinePlotLine =
      maxLine.length > 0 ? (
        <VictoryLine
          data={maxLine}
          interpolation={maxLineStyles.interpolation}
          style={{ data: { stroke: maxLineStyles.stroke } }}
          {...dataKeys}
        />
      ) : null;

    const maxLinePlotScatter =
      maxLine.length > 0 ? (
        <VictoryScatter
          data={maxLine}
          size={3}
          style={{ data: { fill: 'white', stroke: maxLineStyles.stroke, strokeWidth: 2 } }}
          {...dataKeys}
        />
      ) : null;

    const hazardPlotScatter =
      hazards.length > 0 ? (
        <VictoryScatter dataComponent={<HazardPoint />} data={hazards} {...dataKeys} />
      ) : null;

    return (
      <Svg>
        <VictoryChart
          width={width}
          height={height}
          padding={{ top: 20, left: 50, right: 50, bottom: 50 }}
          style={chartStyles}
          theme={VictoryTheme.material}
          maxDomain={{ y: maxDomain }}
          minDomain={{ y: minDomain }}
        >
          <VictoryAxis
            style={{ tickLabels: { fontSize: 15, fontFamily: APP_FONT_FAMILY, fill: '#909192' } }}
          />
          <VictoryAxis
            dependentAxis
            crossAxis={false}
            tickFormat={t => `${t}℃`}
            style={{ tickLabels: { fontSize: 15, fontFamily: APP_FONT_FAMILY, fill: '#909192' } }}
          />
          {minTempPlotLine}
          {maxTempPlotLine}
          {minLinePlotLine}
          {minLinePlotScatter}
          {maxLinePlotLine}
          {maxLinePlotScatter}
          {hazardPlotScatter}
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
  fill: '#70b4f0',
  interpolation: 'natural',
  stroke: '#70b4f0',
};

const maxLineStyles = {
  fill: '#e95c30',
  interpolation: 'natural',
  stroke: '#e95c30',
};

VaccineChart.propTypes = {
  minLine: PropTypes.arrayOf(PropTypes.object),
  maxLine: PropTypes.arrayOf(PropTypes.object),
  hazards: PropTypes.arrayOf(PropTypes.object),
  minTemp: PropTypes.number,
  maxTemp: PropTypes.number,
};

VaccineChart.defaultProps = {
  minLine: [],
  maxLine: [],
  hazards: [],
  minTemp: Infinity,
  maxTemp: -Infinity,
};

export default VaccineChart;
