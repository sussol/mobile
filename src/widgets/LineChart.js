/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter } from 'victory-native';
import { APP_FONT_FAMILY, GREY, LIGHT_GREY, DARK_GREY, SUSSOL_ORANGE } from '../globalStyles';

export const LineChart = ({ title, type, data }) => {
  const [dimensions, setDimensions] = useState({ height: null, width: null });
  const { height, width } = dimensions;

  // Victory Native sizes are set using absolute values. Parents dimensions are used to
  // calculate relative values for width and height for each chart.
  const onLayout = event => {
    const newDimensionsObj = {
      height: event.nativeEvent.layout.width,
      width: event.nativeEvent.layout.height,
    };
    setDimensions(newDimensionsObj);
  };
  // X-axis for bar and line charts.
  const renderXAxis = () => {
    const tickTruncate = label => (label.length > 11 ? `${label.slice(0, 11)}...` : label);
    return <VictoryAxis tickFormat={tickTruncate} style={victoryStyles.axisX.style} />;
  };

  // Y-axis for bar and line charts.
  const renderYAxis = () => <VictoryAxis dependentAxis style={victoryStyles.axisY.style} />;

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
    <View style={localStyles.ChartContainer} onLayout={onLayout}>
      <VictoryChart width={width} height={height} padding={padding}>
        <VictoryScatter size={dotSize} style={dotStyle} data={data} />
        <VictoryLine style={lineStyle} data={data} />
        {renderXAxis()}
        {renderYAxis()}
      </VictoryChart>
    </View>
  );
};

LineChart.propTypes = {
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
};

const localStyles = StyleSheet.create({
  ChartContainer: {
    width: '75%',
    minHeight: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
const victoryStyles = {
  axisX: {
    fixLabelOverlap: true,
    style: {
      axis: { stroke: LIGHT_GREY },
      ticks: { stroke: DARK_GREY },
      tickLabels: { fontFamily: APP_FONT_FAMILY, fill: GREY, textAnchor: 'end', angle: -45 },
    },
  },
  axisY: {
    style: {
      axis: { stroke: LIGHT_GREY },
      ticks: { stroke: DARK_GREY },
      tickLabels: { fontFamily: APP_FONT_FAMILY, fill: GREY },
    },
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
};
