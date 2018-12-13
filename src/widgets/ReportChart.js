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
    };
  }

  onLayout = event => {
    this.setState({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  renderXAxis() {
    return <VictoryAxis style={victoryStyles.axisX.style} />;
  }

  renderYAxis() {
    return <VictoryAxis dependentAxis style={victoryStyles.axisY.style} />;
  }

  renderBarChart() {
    const paddingTop = this.state.height * victoryStyles.barChart.paddingTopRel;
    const paddingBottom = this.state.height * victoryStyles.barChart.paddingBottomRel;
    const paddingLeft = this.state.width * victoryStyles.barChart.paddingLeftRel;
    const paddingRight = this.state.width * victoryStyles.barChart.paddingRightRel;
    const domainPadding =
      this.state.width *
      (1 - (victoryStyles.barChart.paddingLeftRel + victoryStyles.barChart.paddingRightRel)) *
      victoryStyles.barChart.domainPaddingRel;
    return (
      <VictoryChart
        width={this.state.width}
        height={this.state.height}
        padding={{
          top: paddingTop,
          bottom: paddingBottom,
          left: paddingLeft,
          right: paddingRight,
        }}
        domainPadding={domainPadding}
      >
        <VictoryBar style={victoryStyles.barChart.style} data={this.props.report.data} />
        {this.renderXAxis()}
        {this.renderYAxis()}
      </VictoryChart>
    );
  }

  renderLineChart() {
    const paddingTop = this.state.height * victoryStyles.lineChart.paddingTopRel;
    const paddingBottom = this.state.height * victoryStyles.lineChart.paddingBottomRel;
    const paddingLeft = this.state.width * victoryStyles.lineChart.paddingLeftRel;
    const paddingRight = this.state.width * victoryStyles.lineChart.paddingRightRel;
    return (
      <VictoryChart
        width={this.state.width}
        height={this.state.height}
        padding={{
          top: paddingTop,
          bottom: paddingBottom,
          left: paddingLeft,
          right: paddingRight,
        }}
      >
        <VictoryScatter
          size={victoryStyles.scatterChart.size}
          style={victoryStyles.scatterChart.style}
          data={this.props.report.data}
        />
        <VictoryLine style={victoryStyles.lineChart.style} data={this.props.report.data} />
        {this.renderXAxis()}
        {this.renderYAxis()}
      </VictoryChart>
    );
  }

  renderTable() {
    return (
      <ReportTable rows={this.props.report.data.rows} headers={this.props.report.data.header} />
    );
  }

  renderPieChart() {
    const paddingVertical = this.state.height * victoryStyles.pieChart.paddingVerticalRel;
    const paddingHorizontal = this.state.width * victoryStyles.pieChart.paddingHorizontalRel;
    const heightPadded = this.state.width * (1 - victoryStyles.pieChart.paddingVerticalRel);
    const innerRadius = heightPadded * victoryStyles.pieChart.innerRadiusRel;
    const labelRadius = heightPadded * victoryStyles.pieChart.labelRadiusRel;
    return (
      <VictoryPie
        width={this.state.width}
        height={this.state.height}
        padding={{
          top: paddingVertical,
          bottom: paddingVertical,
          right: paddingHorizontal,
          left: paddingHorizontal,
        }}
        padAngle={victoryStyles.pieChart.padAngle}
        innerRadius={innerRadius}
        labelRadius={labelRadius}
        colorScale={victoryStyles.pieChart.colorScale}
        labelComponent={<VictoryLabel style={victoryStyles.pieChart.style} />}
        data={this.props.report.data}
      />
    );
  }

  renderVisualisation() {
    if (this.props.report === null) return null;
    if (!this.state.width || !this.state.height) return null;
    switch (this.props.report.type) {
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
