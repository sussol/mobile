/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

import {
  VictoryLine,
  VictoryScatter,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';

function HazardPoint(props) {
  const { x, y } = props;

  return (
    <Svg>
      <Path
        x={x - 15}
        y={y - 40}
        scale="0.05"
        d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"
        fill="red"
      />
    </Svg>
  );
}

export function VaccineChart(props) {
  // eslint-disable-next-line react/prop-types
  const { minLine, maxLine, hazards, minTemp, maxTemp, width, height } = props;

  if (!minLine && !maxLine) return null;

  let minDomain = minTemp !== undefined ? minTemp : Infinity;
  let maxDomain = maxTemp !== undefined ? maxTemp : -Infinity;

  if (minLine) {
    minLine.forEach(datum => {
      if (datum.temp < minDomain) {
        minDomain = datum.temp;
      }
      if (datum.temp > maxDomain) {
        maxDomain = datum.temp;
      }
    });
  }

  if (maxLine) {
    maxLine.forEach(datum => {
      if (datum.temp < minDomain) {
        minDomain = datum.temp;
      }
      if (datum.temp > maxDomain) {
        maxDomain = datum.temp;
      }
    });
  }

  minDomain -= 1;
  maxDomain += 1;

  const minTempPlotLine =
    minTemp !== undefined ? (
      <VictoryLine y={() => minTemp} style={{ data: { strokeDasharray: '1', stroke: 'blue' } }} />
    ) : null;

  const maxTempPlotLine =
    maxTemp !== undefined ? (
      <VictoryLine y={() => maxTemp} style={{ data: { strokeDasharray: '1', stroke: 'red' } }} />
    ) : null;

  const minLinePlotLine =
    minLine !== undefined ? (
      <VictoryLine
        data={minLine}
        interpolation="natural"
        style={{ data: { stroke: 'blue' } }}
        x="date"
        y="temp"
      />
    ) : null;

  const minLinePlotScatter =
    minLine !== undefined ? (
      <VictoryScatter data={minLine} style={{ data: { fill: 'blue' } }} x="date" y="temp" />
    ) : null;

  const maxLinePlotLine =
    maxLine !== undefined ? (
      <VictoryLine
        data={maxLine}
        interpolation="natural"
        style={{ data: { stroke: 'red' } }}
        x="date"
        y="temp"
      />
    ) : null;

  const maxLinePlotScatter =
    maxLine !== undefined ? (
      <VictoryScatter data={maxLine} style={{ data: { fill: 'red' } }} x="date" y="temp" />
    ) : null;

  const hazardPlotScatter =
    hazards !== undefined ? (
      <VictoryScatter
        dataComponent={<HazardPoint />}
        events={[
          {
            target: 'data',
            eventHandlers: { onPressIn: datum => datum.onClick() },
          },
        ]}
        data={hazards}
        x="date"
        y="temp"
      />
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
}

const chartStyles = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
};

export default VaccineChart;
