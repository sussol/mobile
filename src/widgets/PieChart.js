/* eslint-disable no-unused-vars */
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

export const PieChart = ({ title, type, data }) => {
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
