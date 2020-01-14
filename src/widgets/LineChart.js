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

import { APP_FONT_FAMILY, GREY, LIGHT_GREY, DARK_GREY, SUSSOL_ORANGE } from '../globalStyles';

export const LineChart = ({ width, height, data }) => {
  const renderYAxis = () => <VictoryAxis dependentAxis style={victoryStyles.axisY} />;
  const renderXAxis = () => {
    const tickTruncate = label => (label.length > 11 ? `${label.slice(0, 11)}...` : label);
    return <VictoryAxis tickFormat={tickTruncate} style={victoryStyles.axisX} />;
  };

  const {
    padTop,
    padBottom,
    padLeft,
    padRight,
    dotSize,
    dotStyle,
    lineStyle,
  } = victoryStyles.lineChart;

  const padding = {
    top: height * padTop,
    bottom: height * padBottom,
    left: width * padLeft,
    right: width * padRight,
  };

  return (
    <VictoryChart width={width} height={height} padding={padding}>
      {data.map(({ values }) => (
        <VictoryScatter size={dotSize} style={dotStyle} data={values} />
      ))}
      {data.map(({ values }) => (
        <VictoryLine style={lineStyle} data={values} />
      ))}
      {data.map(({ values, label }) => (
        <VictoryLabel
          datum={{ x: values.length - 1, y: values[values.length - 1].y }}
          text={label}
          style={victoryStyles.labelStyle}
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
    lineStyle: { data: { stroke: SUSSOL_ORANGE } },
  },
  style: { fontFamily: APP_FONT_FAMILY, fill: GREY },
  labelStyle: {
    fontFamily: APP_FONT_FAMILY,
    fill: DARK_GREY,
    fontSize: 16,
  },
};
