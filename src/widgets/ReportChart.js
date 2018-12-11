/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
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

export class ReportChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...props };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...nextProps });
  }

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
    return (
      <VictoryChart
        width={this.state.width}
        height={this.state.height}
        padding={victoryStyles.barChart.padding}
        domainPadding={victoryStyles.barChart.domainPadding}
      >
        <VictoryBar style={victoryStyles.barChart.style} data={this.state.data} />
        {this.renderXAxis()}
        {this.renderYAxis()}
      </VictoryChart>
    );
  }

  renderLineChart() {
    return (
      <VictoryChart
        width={this.state.width}
        height={this.state.height}
        padding={victoryStyles.lineChart.padding}
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
    return (
      <VictoryPie
        width={this.state.width}
        height={this.state.height}
        padding={victoryStyles.pieChart.padding}
        padAngle={victoryStyles.pieChart.padAngle}
        innerRadius={victoryStyles.pieChart.innerRadius}
        labelRadius={victoryStyles.pieChart.labelRadius}
        colorScale={victoryStyles.pieChart.colorScale}
        labelComponent={<VictoryLabel style={victoryStyles.pieChart.style} />}
        data={this.state.data}
      />
    );
  }

  renderChart() {
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

  render() {
    // TODO: return "loading...".
    if (!this.state.width || !this.state.height) return null;
    return this.renderChart();
  }
}

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
    padding: { top: 75, bottom: 75, left: 90, right: 60 },
    domainPadding: 50,
    style: { data: { fill: SUSSOL_ORANGE } },
  },
  scatterChart: {
    size: 3.5,
    style: { data: { fill: SUSSOL_ORANGE } },
  },
  lineChart: {
    padding: { top: 75, bottom: 75, left: 90, right: 60 },
    domainPadding: 50,
    style: { data: { stroke: SUSSOL_ORANGE } },
  },
  pieChart: {
    padding: 75,
    padAngle: 2.5,
    innerRadius: 200,
    labelRadius: 325,
    colorScale: 'warm',
    style: { fontFamily: APP_FONT_FAMILY, fill: GREY },
  },
};
