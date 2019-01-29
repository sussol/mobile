/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryPie,
  VictoryScatter,
} from 'victory-native';
import globalStyles, {
  APP_FONT_FAMILY,
  DARK_GREY,
  LIGHT_GREY,
  GREY,
  SUSSOL_ORANGE,
} from '../globalStyles';

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
export class ReportChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: null,
      height: null,
      report: props.report,
    };
  }

  componentDidUpdate = () => {};

  // Victory Native sizes are set using absolute values. Parents dimensions are used to
  // calculate relative values for width and height for each chart.
  onLayout = event => {
    this.setState({
      width: event.nativeEvent.layout.width * 1.2,
      height: event.nativeEvent.layout.height * 1.2,
    });
  };

  // X-axis for bar and line charts.
  renderXAxis() {
    const tickTruncate = (label, index) => {
      if (index % 2) return '';
      return label.length > 11 ? label.slice(0, 11) + '...' : label;
    };
    return <VictoryAxis tickFormat={tickTruncate} style={victoryStyles.axisX.style} />;
  }

  // Y-axis for bar and line charts.
  renderYAxis() {
    const tickTruncate = (label, index) => {
      return label + '°';
    };
    return (
      <VictoryAxis
        tickFormat={tickTruncate}
        dependentAxis
        style={{ ...victoryStyles.axisY.style }}
      />
    );
  }

  renderBarChart() {
    const { height, width, report } = this.state;
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
      <VictoryChart width={width} height={height} padding={padding} domainPadding={domainPadding}>
        <VictoryBar style={style} data={report.data} />
        {this.renderXAxis()}
        {this.renderYAxis()}
      </VictoryChart>
    );
  }

  renderLineChart() {
    const { height, width, report } = this.state;

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
      <VictoryChart width={width} height={height} padding={padding}>
        <VictoryScatter size={dotSize} style={dotStyle} data={report.data} />
        <VictoryLine style={lineStyle} data={report.data} />
        {this.renderXAxis()}
        {this.renderYAxis()}
      </VictoryChart>
    );
  }

  renderPieChart() {
    const { height, width, report } = this.state;

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
  }

  renderVisualisation() {
    const { height, width, report } = this.state;
    if (report === null || !width || !height) return null;
    switch (report.type) {
      case 'BarChart':
        return this.renderBarChart();
      case 'LineChart':
        return this.renderLineChart();
      case 'PieChart':
        return this.renderPieChart();
      default:
        return null;
    }
  }
  renderTempLine = (data) => {
    const { maxTemp } = this.props;
    const breaches = data.map(({ x, y }) => {
        if(y < maxTemp) return {x, y: null};
        return {x, y};
    });
    const noBreaches = data.map(({x, y}) => {
        if(y >= maxTemp) return {x, y: null};
        return {x, y};
    });

    const result = [];
    result.push(

    <VictoryLine
            domain={[2, 10]}
            style={{
              data: {
                stroke: 'rgb(255, 215, 0)',
              },
            }}
            interpolation={'cardinal'}
            data={noBreaches}
        />
    );
    result.push(

        <VictoryLine
                domain={[2, 10]}
                style={{
                  data: {
                    stroke: 'red',
                  },
                }}
                interpolation={'cardinal'}
                data={breaches}
            />
        );
        return result;
  }

  render() {
    const { minTemp, maxTemp, data } = this.props;
    const { height, width } = this.state;
    const padding = {
      top: height * padTop,
      bottom: height * padBottom,
      left: width * padLeft,
      right: width * padRight,
    };
    const {
      padTop,
      padBottom,
      padLeft,
      padRight,
    } = victoryStyles.lineChart;
    return (
      <View style={localStyles.ChartContainer} onLayout={this.onLayout}>
        <VictoryChart width={this.state.width} height={this.state.height}>
          <VictoryLine
            style={{
              data: {
                stroke: 'red',
                strokeWidth: 1,
              },
            }}
            y={() => maxTemp}
          />
          <VictoryLine
            style={{
              data: {
                stroke: 'red',
                strokeWidth: 1,
              },
            }}
            y={() => minTemp}
          />

          {this.renderTempLine(data)}

          <VictoryLine
            domain={[2, 10]}
            animate={{ duration: 1500 }}
            style={{
              data: {
                stroke: 'rgb(135, 206, 235)',
              },
            }}
            interpolation={'cardinal'}
            data={[
              { x: '23-01 8am', y: 4 },
              { x: '23-01 8pm', y: 4.3 },
              { x: '24-01 8am', y: 3 },
              { x: '24-01 8pm', y: 6 },
              { x: '25-01 8am', y: 8 },
              { x: '25-01 8pm', y: 3 },
              { x: '26-01 8am', y: 3.4 },
              { x: '26-01 8pm', y: 3.2 },
              { x: '27-01 8am', y: 4 },
              { x: '27-01 8pm', y: 3.5 },
              { x: '28-01 8am', y: 2.9 },
              { x: '28-01 8pm', y: 2.8 },
              { x: '29-01 8am', y: 3.5 },
              { x: '29-01 8pm', y: 3.3 },
            ]}
          />

          {this.renderXAxis()}
          {this.renderYAxis()}
        </VictoryChart>
      </View>
    );
  }
}

ReportChart.propTypes = {
  report: PropTypes.object.isRequired,
};

const localStyles = StyleSheet.create({
  ChartContainer: {
    ...globalStyles.appBackground,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const victoryStyles = {
  axisX: {
    fixLabelOverlap: true,
    style: {
      axis: { stroke: SUSSOL_ORANGE },
      ticks: { stroke: SUSSOL_ORANGE },
      tickLabels: {
        fontFamily: APP_FONT_FAMILY,
        fill: SUSSOL_ORANGE,
        textAnchor: 'end',
        angle: -45,
        fontSize: '8px',
      },
    },
  },
  axisY: {
    fixLabelOverlap: false,
    style: {
      axis: { stroke: SUSSOL_ORANGE },
      ticks: { stroke: SUSSOL_ORANGE },
      tickLabels: { fontFamily: APP_FONT_FAMILY, fill: SUSSOL_ORANGE },
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
  lineChart: {
    padTop: 0.1,
    padBottom: 0.15,
    padLeft: 0.1,
    padRight: 0.05,
    dotSize: 3.5,
    dotStyle: { data: { fill: SUSSOL_ORANGE } },
    lineStyle: { data: { stroke: SUSSOL_ORANGE } },
  },
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
