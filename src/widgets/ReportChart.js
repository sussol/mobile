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
import { ReportTable } from './ReportTable';
import { APP_FONT_FAMILY, DARK_GREY, LIGHT_GREY, GREY, SUSSOL_ORANGE } from '../globalStyles';

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

  componentDidUpdate = () => {
    if (this.state.report.id !== this.props.report.id) {
      this.setState({ report: this.props.report });
    }
  };

  // victory-native requires absolute values to render. We use the parents dimensions to
  // create relative values for width and hight for each chart.
  onLayout = event => {
    this.setState({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  renderXAxis() {
    const labelTruncating = label => (label.length > 11 ? label.slice(0, 11) + '...' : label);
    return <VictoryAxis tickFormat={labelTruncating} style={victoryStyles.axisX.style} />;
  }

  renderYAxis() {
    return <VictoryAxis dependentAxis style={victoryStyles.axisY.style} />;
  }

  renderBarChart() {
    const { height, width, report } = this.state;
    const barStyles = victoryStyles.barChart;
    const chartPadding = {
      top: height * barStyles.paddingTopRel,
      bottom: height * barStyles.paddingBottomRel,
      left: width * barStyles.paddingLeftRel,
      right: width * barStyles.paddingRightRel,
    };
    const domainPadMultiplier =
      (1 - (barStyles.paddingLeftRel + barStyles.paddingRightRel)) * barStyles.domainPaddingRel;
    const domainPad = width * domainPadMultiplier;

    return (
      <VictoryChart width={width} height={height} padding={chartPadding} domainPadding={domainPad}>
        <VictoryBar style={barStyles.style} data={report.data} />
        {this.renderXAxis()}
        {this.renderYAxis()}
      </VictoryChart>
    );
  }

  renderLineChart() {
    const { height, width, report } = this.state;
    const lineStyles = victoryStyles.lineChart;
    const scatterStyles = victoryStyles.scatterChart;
    const chartPadding = {
      top: height * lineStyles.paddingTopRel,
      bottom: height * lineStyles.paddingBottomRel,
      left: width * lineStyles.paddingLeftRel,
      right: width * lineStyles.paddingRightRel,
    };
    return (
      <VictoryChart width={width} height={height} padding={chartPadding}>
        <VictoryScatter size={scatterStyles.size} style={scatterStyles.style} data={report.data} />
        <VictoryLine style={lineStyles.style} data={report.data} />
        {this.renderXAxis()}
        {this.renderYAxis()}
      </VictoryChart>
    );
  }

  renderTable() {
    const { report } = this.state;
    return <ReportTable rows={report.data.rows} headers={report.data.header} />;
  }

  renderPieChart() {
    const { height, width, report } = this.state;
    const pieStyles = victoryStyles.pieChart;
    const heightPadded = width * (1 - pieStyles.paddingVerticalRel);
    const chartPadding = {
      top: height * pieStyles.paddingVerticalRel,
      bottom: height * pieStyles.paddingVerticalRel,
      right: width * pieStyles.paddingHorizontalRel,
      left: width * pieStyles.paddingHorizontalRel,
    };

    return (
      <VictoryPie
        width={width}
        height={height}
        padding={chartPadding}
        padAngle={pieStyles.padAngle}
        innerRadius={heightPadded * pieStyles.innerRadiusRel}
        labelRadius={heightPadded * pieStyles.labelRadiusRel}
        colorScale={pieStyles.colorScale}
        labelComponent={<VictoryLabel style={pieStyles.style} />}
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
      case 'Table':
        return this.renderTable();
      case 'PieChart':
        return this.renderPieChart();
      default:
        return null;
    }
  }

  render() {
    return (
      <View style={localStyles.ChartContainer} onLayout={this.onLayout}>
        {this.renderVisualisation()}
      </View>
    );
  }
}

ReportChart.propTypes = {
  report: PropTypes.object.isRequired,
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
    paddingTopRel: 0.1,
    paddingBottomRel: 0.15,
    paddingLeftRel: 0.1,
    paddingRightRel: 0.05,
    domainPaddingRel: 0.05,
    style: { data: { fill: SUSSOL_ORANGE } },
  },
  scatterChart: {
    size: 3.5,
    style: { data: { fill: SUSSOL_ORANGE } },
  },
  lineChart: {
    paddingTopRel: 0.1,
    paddingBottomRel: 0.15,
    paddingLeftRel: 0.1,
    paddingRightRel: 0.05,
    style: { data: { stroke: SUSSOL_ORANGE } },
  },
  pieChart: {
    paddingVerticalRel: 0.15,
    paddingHorizontalRel: 0.15,
    innerRadiusRel: 0.2,
    labelRadiusRel: 0.35,
    padAngle: 2.5,
    colorScale: 'warm',
    style: { fontFamily: APP_FONT_FAMILY, fill: GREY },
  },
};
