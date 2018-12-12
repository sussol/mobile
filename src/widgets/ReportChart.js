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
    const paddingVertical = this.state.height * 0.1;
    const paddingLeft = this.state.width * 0.1;
    const paddingRight = this.state.width * 0.05;
    const domainPadding = this.state.width * 0.85 * 0.05;
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
    const paddingVertical = this.state.height * 0.1;
    const paddingLeft = this.state.width * 0.1;
    const paddingRight = this.state.width * 0.05;
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
    const paddingVertical = this.state.height * 0.15;
    const paddingHorizontal = this.state.width * 0.15;
    const heightPadded = this.state.width * 0.85;
    const innerRadius = heightPadded * 0.2;
    const labelRadius = heightPadded * 0.35;
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
    style: { data: { fill: SUSSOL_ORANGE } },
  },
  scatterChart: {
    size: 3.5,
    style: { data: { fill: SUSSOL_ORANGE } },
  },
  lineChart: {
    style: { data: { stroke: SUSSOL_ORANGE } },
  },
  pieChart: {
    padAngle: 2.5,
    colorScale: 'warm',
    style: { fontFamily: APP_FONT_FAMILY, fill: GREY },
  },
};
