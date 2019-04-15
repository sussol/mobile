/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import {
  VictoryLine,
  VictoryScatter,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';

import Svg from 'react-native-svg';

import { HazardPoint } from './HazardPoint';

const getMinTemp = (minTemp, { temp }) => (temp < minTemp ? temp : minTemp);
const getMaxTemp = (maxTemp, { temp }) => (temp > maxTemp ? temp : maxTemp);

export const VaccineChart = props => {
  const { minLine, maxLine, hazards, minTemp, maxTemp, width, height } = props;

  const x = 'date';
  const y = 'temp';

  if (!minLine && !maxLine) return null;

  const minDomain = minLine.concat(maxLine).reduce(getMinTemp, minTemp) - 1;
  const maxDomain = minLine.concat(maxLine).reduce(getMaxTemp, maxTemp) + 1;

  const minTempPlotLine =
    minTemp !== Infinity ? (
      <VictoryLine
        y={() => minTemp}
        style={{
          data: { strokeDasharray: minLineStyles.strokeDasharray, stroke: minLineStyles.stroke },
        }}
      />
    ) : null;

  const maxTempPlotLine =
    maxTemp !== -Infinity ? (
      <VictoryLine
        y={() => maxTemp}
        style={{
          data: { strokeDasharray: maxLineStyles.strokeDasharray, stroke: maxLineStyles.stroke },
        }}
      />
    ) : null;

  const minLinePlotLine =
    minLine.length > 0 ? (
      <VictoryLine
        data={minLine}
        interpolation={minLineStyles.interpolation}
        style={{ data: { stroke: minLineStyles.stroke } }}
        x={x}
        y={y}
      />
    ) : null;

  const minLinePlotScatter =
    minLine.length > 0 ? (
      <VictoryScatter data={minLine} style={{ data: { fill: minLineStyles.fill } }} x={x} y={y} />
    ) : null;

  const maxLinePlotLine =
    maxLine.length > 0 ? (
      <VictoryLine
        data={maxLine}
        interpolation={maxLineStyles.interpolation}
        style={{ data: { stroke: maxLineStyles.stroke } }}
        x={x}
        y={y}
      />
    ) : null;

  const maxLinePlotScatter =
    maxLine.length > 0 ? (
      <VictoryScatter data={maxLine} style={{ data: { fill: maxLineStyles.fill } }} x={x} y={y} />
    ) : null;

  const hazardPlotScatter =
    hazards.length > 0 ? (
      <VictoryScatter dataComponent={<HazardPoint />} data={hazards} x={x} y={y} />
    ) : null;

  return (
    // Svg wrapper fixes victory-native onPressIn bug on Android devices.
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
};

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
  minTemp: PropTypes.number,
  maxTemp: PropTypes.number,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

VaccineChart.defaultProps = {
  minLine: [],
  maxLine: [],
  hazards: [],
  minTemp: Infinity,
  maxTemp: -Infinity,
};

export default VaccineChart;
