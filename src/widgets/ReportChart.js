/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { PieChart, BarChart, LineChart, ReportTable } from './index';

export const ReportChart = ({ report }) => {
  const { type, data } = report;
  const { rows, header } = data;
  const [dimensions, setDimensions] = useState({ height: null, width: null });
  const { height, width } = dimensions;

  // Victory Native sizes are set using absolute values. Parents dimensions are used to
  // calculate relative values for width and height for each chart.
  const onLayout = event => {
    const newDimensionsObj = {
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width,
    };
    setDimensions(newDimensionsObj);
  };

  const renderChart = () => {
    if (report === null || !width || !height) return null;
    switch (type) {
      case 'BarChart':
        return <BarChart report={report} height={height} width={width} />;
      case 'LineChart':
        return <LineChart report={report} height={height} width={width} />;
      case 'Table':
        return <ReportTable rows={rows} header={header} />;
      case 'PieChart':
        return <PieChart report={report} height={height} width={width} />;
      default:
        return null;
    }
  };

  return (
    <View style={localStyles.ChartContainer} onLayout={onLayout}>
      {renderChart(type)}
    </View>
  );
};

const localStyles = StyleSheet.create({
  ChartContainer: { flex: 1 },
});

ReportChart.propTypes = {
  report: PropTypes.object.isRequired,
  rows: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
};
