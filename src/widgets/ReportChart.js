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
  renderTempLine = ({ data, color, domain, style = {} }) => (
    <VictoryLine
      domain={domain}
      style={{
        data: {
          stroke: color,
          ...style,
        },
      }}
      interpolation={'cardinal'}
      data={data}
    />
  );

  renderLines = ({ lines, minTemp, maxTemp, currentTemp }) => {
    let minLine = minTemp;
    let maxLine = maxTemp;

    if (currentTemp > maxLine) maxLine = currentTemp;
    if (currentTemp < minLine) minLine = currentTemp;

    lines.forEach((line) => {
      line.data.forEach((data) => {
        if (data.y > maxLine) maxLine = data.y;
        if (data.y < minLine) minLine = data.y;
      });
    });

    const domain = [minLine - 2, maxLine + 2];


    const result = lines.map(line => this.renderTempLine({ ...line, domain }));

    result.push(
      this.renderTempLine({
        color: 'red',
        domain,
        data: lines[0].data.map(({ x }) => ({ x, y: minTemp })),
        style: { strokeWidth: 0.3 },
      }),
    );
    result.push(
      this.renderTempLine({
        color: 'red',
        domain,
        data: lines[0].data.map(({ x }) => ({ x, y: maxTemp })),
        style: { strokeWidth: 0.3 },
      }),
    );

    return result;
  };

  render() {
    const { minTemp, maxTemp, lines, currentTemp } = this.props;
    return (
      <View style={localStyles.ChartContainer} onLayout={this.onLayout}>
        <VictoryChart width={this.state.width} height={this.state.height}>

          {this.renderLines({ lines, minTemp, maxTemp, currentTemp })}
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
