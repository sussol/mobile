/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
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
    this.state = { ...props };
  }

  componentDidUpdate = prevProps => {
    if (!this.state.width || prevProps.id !== this.props.id) {
      this.setState({ ...this.props });
    }
  };

  renderXAxis() {
    return (
      <VictoryAxis
        fixLabelOverlap={victoryStyles.axisX.fixLabelOverlap}
        style={victoryStyles.axisX.style}
      />
    );
  }

  renderYAxis() {
    return (
      <VictoryAxis
        dependentAxis
        fixLabelOverlap={victoryStyles.axisY.fixLabelOverlap}
        style={victoryStyles.axisY.style}
      />
    );
  }

  renderBarChart() {
    const paddingVertical = this.state.height * victoryStyles.barChart.paddingVerticalRel;
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
          top: paddingVertical,
          bottom: paddingVertical,
          left: paddingLeft,
          right: paddingRight,
        }}
        domainPadding={domainPadding}
      >
        <VictoryBar style={victoryStyles.barChart.style} data={this.state.data} />
        {this.renderXAxis()}
        {this.renderYAxis()}
      </VictoryChart>
    );
  }

  renderLineChart() {
    const paddingVertical = this.state.height * victoryStyles.barChart.paddingVerticalRel;
    const paddingLeft = this.state.width * victoryStyles.barChart.paddingLeftRel;
    const paddingRight = this.state.width * victoryStyles.barChart.paddingRightRel;
    return (
      <VictoryChart
        width={this.state.width}
        height={this.state.height}
        padding={{
          top: paddingVertical,
          bottom: paddingVertical,
          left: paddingLeft,
          right: paddingRight,
        }}
      >
        <VictoryScatter
          size={victoryStyles.scatterChart.size}
          style={victoryStyles.scatterChart.style}
          data={this.state.data}
        />
        <VictoryLine style={victoryStyles.lineChart.style} data={this.state.data} />
        {this.renderXAxis()}
        {this.renderYAxis()}
      </VictoryChart>
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
        data={this.state.data}
      />
    );
  }

  render() {
    if (!this.state.width || !this.state.height) return null;
    switch (this.state.type) {
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
}

ReportChart.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

const victoryStyles = {
  axisX: {
    fixLabelOverlap: true,
    style: {
      axis: { stroke: LIGHT_GREY },
      ticks: { stroke: DARK_GREY },
      tickLabels: { fontFamily: APP_FONT_FAMILY, fill: GREY },
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
    paddingVerticalRel: 0.1,
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
    paddingVerticalRel: 0.1,
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
