/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import Svg from 'react-native-svg';

import { VictoryLine, VictoryScatter, VictoryChart, VictoryTheme } from 'victory-native';

export function VaccineChart(props) {
  // eslint-disable-next-line react/prop-types
  const { lines, width, height } = props;
  // eslint-disable-next-line react/prop-types
  let { maxTemp, minTemp } = props;

  lines.forEach(line => {
    line.data.forEach(datum => {
      minTemp = datum.temp < minTemp ? datum.temp : minTemp;
      maxTemp = datum.temp > maxTemp ? datum.temp : maxTemp;
    });
  });

  lines.forEach(line => {
    line.data.forEach(datum => {
      datum.isBreach = datum.temp < minTemp || datum.temp > maxTemp;
      datum.label = datum.isBreach ? 'BREACH' : '';
    });
  });

  const maxDomain = maxTemp + 1;
  const minDomain = minTemp - 1;

  const maxLinePlot = (
    <VictoryLine y={() => maxTemp} style={{ data: { strokeDasharray: '1', stroke: 'red' } }} />
  );
  const minLinePlot = (
    <VictoryLine y={() => minTemp} style={{ data: { strokeDasharray: '1', stroke: 'blue' } }} />
  );

  const linePlots = lines.map(line => (
    <VictoryLine
      data={line.data}
      interpolation="natural"
      style={{ data: { stroke: line.color } }}
      x="date"
      y="temp"
    />
  ));

  const scatterPlots = lines.map(line => (
    <VictoryScatter
      style={{ data: { fill: line.color } }}
      labels={() => null}
      events={[
        {
          target: 'data',
          eventHandlers: { onPressIn: () => line.eventHandler() },
        },
      ]}
      size={7.5}
      data={line.data}
      x="date"
      y="temp"
    />
  ));

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
        {maxLinePlot}
        {minLinePlot}
        {linePlots}
        {scatterPlots}
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
