/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { PieChart } from './PieChart';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { ReportTable } from './ReportTable';

/**
 * A charting widget for displaying reports as bar charts, line charts and pie graphs.
 *
 * @prop  {string}       id      The report ID.
 * @prop  {string}       title   The title of the report.
 * @prop  {string}       type    The type of chart to use to display the report,
 *                               options are BarChart, LineChart and PieChart.
 * @prop  {data}         array   An array of {x, y} datapoints to plot.
 * @prop  {width}        number  The width of the parent container.
 * @prop  {height}       number  The height of the parent continer.
 */
export const ReportChart = ({ type, title, data }) => {
  const { rows, header } = data;
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

  const renderChart = () => {
    if (data === null || !width || !height) return null;
    switch (type) {
      case 'BarChart':
        return <BarChart />;
      case 'LineChart':
        return <LineChart />;
      case 'Table': {
        return <ReportTable rows={rows} header={header} />;
      }
      case 'PieChart':
        return <PieChart report={(type, title, data)} />;
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
  ChartContainer: {
    width: '75%',
    minHeight: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

ReportChart.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  rows: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
};
