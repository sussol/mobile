/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import Svg, { Rect } from 'react-native-svg';

import {
  VictoryLine,
  VictoryScatter,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';

function HazardPoint(props) {
  const { x, y } = props;

  const width = 10;
  const height = 10;

  return (
    <Svg>
      <Rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        stroke="red"
        stroke-width="2.5"
        fill="red"
      />
    </Svg>
  );
}

export function VaccineChart(props) {
  // eslint-disable-next-line react/prop-types
  const { minLine, maxLine, hazards, minTemp, maxTemp, width, height } = props;

  let minDomain = Infinity;
  let maxDomain = -Infinity;

  minLine.forEach(datum => {
    if (datum.temp < minDomain) {
      minDomain = datum.temp;
    }
  });

  maxLine.forEach(datum => {
    if (datum.temp > maxDomain) {
      maxDomain = datum.temp;
    }
  });

  minDomain -= 1;
  maxDomain += 1;

  const minTempPlotLine = (
    <VictoryLine y={() => minTemp} style={{ data: { strokeDasharray: '1', stroke: 'blue' } }} />
  );

  const maxTempPlotLine = (
    <VictoryLine y={() => maxTemp} style={{ data: { strokeDasharray: '1', stroke: 'red' } }} />
  );

  const minLinePlotLine = (
    <VictoryLine
      data={minLine}
      interpolation="natural"
      style={{ data: { stroke: 'blue' } }}
      x="date"
      y="temp"
    />
  );

  const minLinePlotScatter = (
    <VictoryScatter data={minLine} style={{ data: { fill: 'blue' } }} x="date" y="temp" />
  );

  const maxLinePlotLine = (
    <VictoryLine
      data={maxLine}
      interpolation="natural"
      style={{ data: { stroke: 'red' } }}
      x="date"
      y="temp"
    />
  );

  const maxLinePlotScatter = (
    <VictoryScatter data={maxLine} style={{ data: { fill: 'red' } }} x="date" y="temp" />
  );

  const hazardPlotScatter = (
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
  );

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
