/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { useState } from 'react';
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
 * @prop  {height}       number  The height of the parent container.
 */

export const PieChart = ({ title, type, data }) => {
  const [state, setState] = useState({ height: null, width: null });
  const { height, width } = state;

  // Victory Native sizes are set using absolute values. Parents dimensions are used to
  // calculate relative values for width and height for each chart.

  const onLayout = event => {
    const newStateObj = {
      height: event.nativeEvent.layout.width,
      width: event.nativeEvent.layout.height,
    };
    setState(newStateObj);
  };
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

  const widthPadded = state.width * (1 - padHorizontal);
  return (
    <View style={localStyles.ChartContainer} onLayout={onLayout}>
      <VictoryPie
        width={width}
        height={height}
        padding={padding}
        padAngle={padAngle}
        innerRadius={widthPadded * innerRadius}
        labelRadius={widthPadded * labelRadius}
        colorScale={colorScale}
        labelComponent={<VictoryLabel style={style} />}
        data={data}
      />
    </View>
  );
};

PieChart.propTypes = {
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
