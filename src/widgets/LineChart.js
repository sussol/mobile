/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryScatter,
} from 'victory-native';

import {
  APP_FONT_FAMILY,
  GREY,
  LIGHT_GREY,
  DARK_GREY,
  SUSSOL_ORANGE,
  FINALISE_GREEN,
  FINALISED_RED,
} from '../globalStyles';

/**
 * This page renders a LineChart graph
 *
 * @prop  {number}  width   Horizontal size of the graph container
 * @prop  {number}  height  Vertical size of the graph container
 * @prop  {array}   data    Contains labels and x and y values to plot
 */

export const LineChart = ({ width, height, data }) => {
  const renderYAxis = () => <VictoryAxis dependentAxis style={victoryStyles.axisY} />;
  const renderXAxis = () => {
    const tickTruncate = label => (label.length > 11 ? `${label.slice(0, 11)}...` : label);
    return <VictoryAxis tickFormat={tickTruncate} style={victoryStyles.axisX} />;
  };

  const { padTop, padBottom, padLeft, padRight, dotSize } = victoryStyles.lineChart;

  const padding = {
    top: height * padTop,
    bottom: height * padBottom,
    left: width * padLeft,
    right: width * padRight,
  };

  const COLOURS = {
    0: SUSSOL_ORANGE,
    1: FINALISE_GREEN,
    2: GREY,
    3: FINALISED_RED,
    4: LIGHT_GREY,
  };

  return (
    <VictoryChart width={width} height={height} padding={padding}>
      {data.map(({ values }, index) => (
        <VictoryScatter size={dotSize} style={{ data: { fill: COLOURS[index] } }} data={values} />
      ))}
      {data.map(({ values }, index) => (
        <VictoryLine style={{ data: { stroke: COLOURS[index] } }} data={values} />
      ))}
      {data.map(({ values, label }, index) => (
        <VictoryLabel
          datum={{ x: values.length - 1, y: values[values.length - 1].y }}
          text={label}
          style={{ fontFamily: APP_FONT_FAMILY, fontSize: 18, fill: COLOURS[index] }}
          textAnchor="middle"
        />
      ))}
      {renderYAxis()}
      {renderXAxis()}
    </VictoryChart>
  );
};

LineChart.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
};

const victoryStyles = {
  axisX: {
    axis: { stroke: LIGHT_GREY },
    ticks: { stroke: DARK_GREY },
    tickLabels: { fontFamily: APP_FONT_FAMILY, fill: GREY, textAnchor: 'end', angle: -45 },
  },
  axisY: {
    axis: { stroke: LIGHT_GREY },
    ticks: { stroke: DARK_GREY },
    tickLabels: { fontFamily: APP_FONT_FAMILY, fill: GREY },
  },
  lineChart: {
    padTop: 0.1,
    padBottom: 0.15,
    padLeft: 0.1,
    padRight: 0.05,
    dotSize: 3.5,
    dotStyle: { data: { fill: SUSSOL_ORANGE } },
    lineStyle: { data: { stroke: GREY }, color: GREY },
    labelStyle: { fontFamily: APP_FONT_FAMILY, fontSize: 18 },
  },
};
