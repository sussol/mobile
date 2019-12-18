/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { VictoryLabel, VictoryPie } from 'victory-native';
import { APP_FONT_FAMILY, GREY } from '../globalStyles';

/**
 * A charting widget for displaying Pie chart report.
 *
 * @prop  {string}       id      The report ID.
 * @prop  {string}       title   The title of the report.
 * @prop  {string}       type    The type of chart to use to display the report,
 *                               options are BarChart, LineChart and PieChart.
 * @prop  {data}         array   An array of {x, y} datapoints to plot.
 * @prop  {width}        number  The width of the parent container.
 * @prop  {height}       number  The height of the parent continer.
 */

export const ReportChart = ({ report: initialReport }, props) => {
  const [report, setReport] = useState(initialReport);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);

  // Same affect as componentDidUpdate
  useEffect(() => {
    if (report.id !== props.report.id) setReport(props.report);
  });

  // Victory Native sizes are set using absolute values. Parents dimensions are used to
  // calculate relative values for width and height for each chart.
  const onLayout = event => {
    setWidth(event.nativeEvent.layout.width);
    setHeight(event.nativeEvent.layout.height);
  };

  const renderPieChart = () => {
    const {
      padVertical,
      padHorizontal,
      innerRadius,
      labelRadius,
      padAngle,
      colorScale,
      style,
    } = victoryStyles.pieChart;

    const padding = {
      top: height * padVertical,
      bottom: height * padVertical,
      right: width * padHorizontal,
      left: width * padHorizontal,
    };

    const widthPadded = width * (1 - padHorizontal);

    return (
      <VictoryPie
        width={width}
        height={height}
        padding={padding}
        padAngle={padAngle}
        innerRadius={widthPadded * innerRadius}
        labelRadius={widthPadded * labelRadius}
        colorScale={colorScale}
        labelComponent={<VictoryLabel style={style} />}
        data={report.data}
      />
    );
  };

  const renderVisualisation = () => {
    if (report === null || !width || !height) return null;
    switch (report.type) {
      case 'PieChart':
        return renderPieChart();
      default:
        return null;
    }
  };
  return (
    <View style={localStyles.ChartContainer} onLayout={onLayout}>
      {renderVisualisation()}
    </View>
  );
};

ReportChart.propTypes = {
  report: PropTypes.objectOf(PropTypes.object).isRequired,
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
  pieChart: {
    padVertical: 0.15,
    padHorizontal: 0.15,
    innerRadius: 0.2,
    labelRadius: 0.375,
    padAngle: 2.5,
    colorScale: 'warm',
    style: { fontFamily: APP_FONT_FAMILY, fill: GREY },
  },
};
