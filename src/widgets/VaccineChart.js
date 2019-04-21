/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet } from 'react-native';

import {
  VictoryLine,
  VictoryScatter,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
} from 'victory-native';

import Svg from 'react-native-svg';

import { HazardPoint } from './HazardPoint';
import { APP_FONT_FAMILY, GREY, SUSSOL_ORANGE, WARM_BLUE } from '../globalStyles';

/**
 * A chart component for plotting vaccine sensor log data.
 *
 * Plots maximum and/or minimum vaccine temperatures. Optionally
 * displays temperature breaches using hazard icons which can be
 * used to trigger onPress events passed as props.
 */
export class VaccineChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: null,
      height: null,
    };
  }

  // Victory Native sizes are set using absolute values. Parents dimensions are used to
  // calculate relative values for width and height for each chart.
  onLayout = event => {
    this.setState({
      width: event.nativeEvent.layout.width * chartSize.width,
      height: event.nativeEvent.layout.height * chartSize.height,
    });
  };

  // Calculates maximum and minimum temperatures for chart y-axis.
  getDomain() {
    const { minLine, maxLine, minTemperature, maxTemperature, dataKeys } = this.props;
    const lines = [...minLine, ...maxLine];

    const { y: temperatureKey } = dataKeys;

    const minDomain =
      lines.reduce(
        (currentMinTemperature, sensorLog) =>
          Math.min(currentMinTemperature, sensorLog[temperatureKey]),
        minTemperature
      ) - 1;

    const maxDomain =
      lines.reduce(
        (currentMaxTemperature, sensorLog) =>
          Math.max(currentMaxTemperature, sensorLog[temperatureKey]),
        maxTemperature
      ) + 1;

    return { minDomain, maxDomain };
  }

  // Plots line marking minimum temperature boundary for breaches.
  renderMinTemperatureBoundary() {
    const { minTemperature } = this.props;

    // minTemp default prop is Infinity.
    return minTemperature !== Infinity ? (
      <VictoryLine y={() => minTemperature} {...minBoundaryStyles} />
    ) : null;
  }

  // Render line plot of maximum temperature boundary for breaches.
  renderMaxTemperatureBoundary() {
    const { maxTemperature } = this.props;

    // maxTemp default prop is -Infinity.
    return maxTemperature !== -Infinity ? (
      <VictoryLine y={() => maxTemperature} {...maxBoundaryStyles} />
    ) : null;
  }

  // Render line plot of minimum log temperatures.
  renderMinLogTemperatureLine() {
    const { minLine, dataKeys } = this.props;

    if (!(minLine.length > 0)) return null;

    return <VictoryLine data={minLine} {...minLineStyles} {...dataKeys} />;
  }

  // Render data points of minimum log temperature line plot.
  renderMinLogTemperatureScatter() {
    const { minLine, dataKeys } = this.props;

    if (!(minLine.length > 0)) return null;

    return <VictoryScatter data={minLine} {...minScatterStyles} {...dataKeys} />;
  }

  // Render line plot of maximum log temperatures.
  renderMaxLogTemperatureLine() {
    const { maxLine, dataKeys } = this.props;

    if (!(maxLine.length > 0)) return null;

    return <VictoryLine data={maxLine} {...maxLineStyles} {...dataKeys} />;
  }

  // Render data points of maximum log temperature line plot.
  renderMaxLogTemperatureScatter() {
    const { maxLine, dataKeys } = this.props;

    if (!(maxLine.length > 0)) return null;

    return <VictoryScatter data={maxLine} {...maxScatterStyles} {...dataKeys} />;
  }

  // Render hazard icons for sensor breaches.
  renderHazardPoints() {
    const { breaches, onPress, dataKeys } = this.props;

    if (!(breaches.length > 0)) return null;

    return breaches.map(breach => (
      <VictoryScatter
        key={breach[0].id}
        dataComponent={<HazardPoint onPress={onPress} breach={breach} />}
        data={breach}
        {...dataKeys}
      />
    ));
  }

  // Helper method for rendering vaccine chart.
  renderPlot() {
    const { minLine, maxLine } = this.props;

    if (minLine.length + maxLine.length === 0) return null;

    const { width, height } = this.state;

    // First render will always return null due to sizing using onLayout.
    if (!width || !height) return null;

    const { minDomain, maxDomain } = this.getDomain();

    return (
      <Svg>
        <VictoryChart
          width={width}
          height={height}
          theme={VictoryTheme.material}
          maxDomain={{ y: maxDomain }}
          minDomain={{ y: minDomain }}
          {...chartStyles}
        >
          <VictoryAxis {...dateAxisStyles} />
          <VictoryAxis dependentAxis crossAxis={false} {...tempAxisStyles} />
          {this.renderMinLogTemperatureLine()}
          {this.renderMinLogTemperatureScatter()}
          {this.renderMaxLogTemperatureLine()}
          {this.renderMaxLogTemperatureScatter()}
          {this.renderMinTemperatureBoundary()}
          {this.renderMaxTemperatureBoundary()}
          {this.renderHazardPoints()}
        </VictoryChart>
      </Svg>
    );
  }

  render() {
    return (
      // Svg wrapper fixes victory-native onPressIn bug on Android devices.
      <View style={{ width: '100%', height: '100%' }} onLayout={this.onLayout}>
        {this.renderPlot()}
      </View>
    );
  }
}

const chartSize = {
  width: 1,
  height: 1.025,
};

const chartStyles = StyleSheet.create({
  style: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  padding: { top: 20, left: 50, bottom: 50, right: 50 },
});

const tempAxisStyles = {
  style: {
    fontSize: 15,
    fontFamily: APP_FONT_FAMILY,
    fill: GREY,
  },
  offsetX: 50,
  // Unicode for degrees celcius.
  tickFormat: t => `${t}\u2103`,
};

const dateAxisStyles = {
  style: {
    fontSize: 15,
    fontFamily: APP_FONT_FAMILY,
    fill: GREY,
  },
  offsetY: 50,
};

const minBoundaryStyles = {
  style: {
    data: {
      stroke: WARM_BLUE,
      opacity: 0.3,
    },
  },
};

const maxBoundaryStyles = {
  style: {
    data: {
      stroke: SUSSOL_ORANGE,
      opacity: 0.3,
    },
  },
};

const minLineStyles = {
  style: {
    data: {
      stroke: WARM_BLUE,
    },
  },
  interpolation: 'natural',
};

const maxLineStyles = {
  style: {
    data: {
      stroke: SUSSOL_ORANGE,
    },
  },
  interpolation: 'natural',
};

const minScatterStyles = {
  style: {
    data: {
      fill: 'white',
      stroke: WARM_BLUE,
      strokeWidth: 2,
      size: 3,
    },
  },
};

const maxScatterStyles = {
  style: {
    data: {
      fill: 'white',
      stroke: SUSSOL_ORANGE,
      strokeWidth: 2,
      size: 3,
    },
  },
};

VaccineChart.propTypes = {
  minLine: PropTypes.arrayOf(PropTypes.object),
  maxLine: PropTypes.arrayOf(PropTypes.object),
  breaches: PropTypes.arrayOf(PropTypes.array),
  minTemperature: PropTypes.number,
  maxTemperature: PropTypes.number,
  onPress: PropTypes.func,
  dataKeys: PropTypes.objectOf(PropTypes.string),
};

VaccineChart.defaultProps = {
  minLine: [],
  maxLine: [],
  breaches: [],
  minTemperature: Infinity,
  maxTemperature: -Infinity,
  onPress: null,
  dataKeys: { x: 'timestamp', y: 'temperature' },
};

export default VaccineChart;
