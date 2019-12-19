/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { VictoryChart, VictoryBar, VictoryAxis } from 'victory-native';
import { SUSSOL_ORANGE } from '../globalStyles';

export const BarChart = ({ title, type, data }) => {
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

  const { padTop, padBottom, padLeft, padRight, padDomain, style } = victoryStyles.barChart;

  const padding = {
    top: height * padTop,
    bottom: height * padBottom,
    left: width * padLeft,
    right: width * padRight,
  };

  const chartDimensions = width * (1 - (padLeft + padRight));
  const domainPadding = chartDimensions * padDomain;

  return (
    <View style={localStyles.ChartContainer} onLayout={onLayout}>
      <VictoryChart width={width} height={height} padding={padding} domainPadding={domainPadding}>
        <VictoryBar style={style} data={data} />
        {renderXAxis()}
        {renderYAxis()}
      </VictoryChart>
    </View>
  );
};

BarChart.propTypes = {
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
  barChart: {
    padTop: 0.1,
    padBottom: 0.15,
    padLeft: 0.1,
    padRight: 0.05,
    padDomain: 0.05,
    style: { data: { fill: SUSSOL_ORANGE } },
  },
};
