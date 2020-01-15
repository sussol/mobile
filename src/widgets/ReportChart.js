/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { PieChart, BarChart, LineChart, ReportTable } from './index';

/**
 * This page uses the incoming type of Report to render the corresponding component
 *
 * @prop  {Object}  report  Realm Report Object
 */

export const ReportChart = ({ report }) => {
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
    if (!report || !(width ?? false) || !(height ?? false)) return null;
    const { type, data } = report;
    const { rows, header } = data;
    switch (type) {
      case 'BarChart':
        return <BarChart data={data} height={height} width={width} />;
      case 'LineChart':
        return <LineChart data={data} height={height} width={width} />;
      case 'Table':
        return <ReportTable rows={rows} header={header} />;
      case 'PieChart':
        return <PieChart data={data} height={height} width={width} />;
      default:
        return null;
    }
  };

  return (
    <View style={localStyles.ChartContainer} onLayout={onLayout}>
      {renderChart()}
    </View>
  );
};

const localStyles = StyleSheet.create({
  ChartContainer: { flex: 1, minHeight: '100%' },
});

ReportChart.propTypes = {
  report: PropTypes.object.isRequired,
};
