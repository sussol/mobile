/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter } from 'victory-native';
import { FlexView } from './FlexView';

import { useLayoutDimensions } from '../hooks/useLayoutDimensions';

import { WHITE, SUSSOL_ORANGE, APP_FONT_FAMILY, GREY } from '../globalStyles';

export const BreachChart = ({ lineData, x, y, xTickFormat, yTickFormat, breach }) => {
  const [width, height, setDimensions] = useLayoutDimensions();

  const { minimumTemperature, maximumTemperature, colour } = breach;

  const lineStyle = React.useMemo(
    () => ({ data: { stroke: /^#[0-9A-F]{6}$/i.test(colour) ? colour : SUSSOL_ORANGE } }),
    []
  );
  const scatterStyle = React.useMemo(
    () => ({ data: { fill: WHITE, stroke: colour ?? SUSSOL_ORANGE, strokeWidth: 2, size: 3 } }),
    []
  );
  const domain = React.useMemo(() => ({ y: [minimumTemperature - 5, maximumTemperature + 5] }), []);

  return (
    <FlexView onLayout={setDimensions}>
      <VictoryChart width={width} height={height} domain={domain}>
        <VictoryAxis offsetX={50} dependentAxis style={chartStyles.axis} tickFormat={yTickFormat} />
        <VictoryAxis offsetY={50} tickFormat={xTickFormat} style={chartStyles.axis} />
        <VictoryLine interpolation="natural" data={lineData} y={y} x={x} style={lineStyle} />
        <VictoryScatter data={lineData} y={y} x={x} style={scatterStyle} />
      </VictoryChart>
    </FlexView>
  );
};

BreachChart.defaultProps = {
  x: 'timestamp',
  y: 'temperature',
  xTickFormat: tick => moment(new Date(tick)).format('DD/MM'),
  yTickFormat: tick => `${tick} \u2103`,
};

BreachChart.propTypes = {
  x: PropTypes.string,
  y: PropTypes.string,
  lineData: PropTypes.array.isRequired,
  xTickFormat: PropTypes.func,
  yTickFormat: PropTypes.func,
  breach: PropTypes.object.isRequired,
};

const chartStyles = {
  maxBoundaryLine: { data: { stroke: SUSSOL_ORANGE, opacity: 0.3 } },
  minBoundaryLine: { data: { stroke: '#70b4f0', opacity: 0.3 } },

  minScatterPlot: { data: { fill: 'white', stroke: '#70b4f0', strokeWidth: 2, size: 3 } },
  maxScatterPlot: { data: { fill: 'white', stroke: SUSSOL_ORANGE, strokeWidth: 2, size: 3 } },
  maxLine: { data: { stroke: SUSSOL_ORANGE } },
  minLine: { data: { stroke: '#70b4f0' } },
  axis: { fontSize: 15, fontFamily: APP_FONT_FAMILY, fill: GREY },
};
