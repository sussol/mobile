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
import { APP_FONT_FAMILY, GREY, LIGHT_GREY, DARK_GREY, SUSSOL_ORANGE } from '../../globalStyles';

export const ReportTable = ({ title, type, data }) => {
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

  const { padTop, padBottom, padLeft, padRight, padDomain, style } = victoryStyles.barChart;

  const padding = {
    top: height * padTop,
    bottom: height * padBottom,
    left: width * padLeft,
    right: width * padRight,
  };

  const chartDimensions = width * (1 - (padLeft + padRight));
  const domainPadding = chartDimensions * padDomain;

  const { rows, header } = data;

  return (
    <View style={localStyles.ChartContainer} onLayout={onLayout}>
      <ReportTable rows={rows} headers={header} />;
    </View>
  );
};

ReportTable.propTypes = {
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
    fixLabelOverlap: false,
    style: {
      axis: { stroke: LIGHT_GREY },
      ticks: { stroke: DARK_GREY },
      tickLabels: { fontFamily: APP_FONT_FAMILY, fill: GREY },
    },
  },
  barChart: {
    padTop: 0.1,
    padBottom: 0.15,
    padLeft: 0.1,
    padRight: 0.05,
    padDomain: 0.05,
    style: { data: { fill: SUSSOL_ORANGE } },
  },
};
