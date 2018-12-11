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
        fixLabelOverlap={victoryStyles.BarChart.fixLabelOverlap}
        style={{
          axis: victoryStyles.BarChart.axis,
          ticks: victoryStyles.BarChart.ticks,
          tickLabels: victoryStyles.BarChart.tickLabels,
        }}
      />
    );
  }

  renderYAxis() {
    return (
      <VictoryAxis
        dependentAxis
        fixLabelOverlap={victoryStyles.BarChart.fixLabelOverlap}
        style={{
          axis: victoryStyles.BarChart.axis,
          ticks: victoryStyles.BarChart.ticks,
          tickLabels: victoryStyles.BarChart.tickLabels,
        }}
      />
    );
  }

  renderBarChart() {
    return (
      <VictoryChart
        width={this.state.width}
        height={this.state.height}
        padding={victoryStyles.BarChart.padding}
        domainPadding={victoryStyles.BarChart.domainPadding}
      >
        <VictoryBar style={{ data: victoryStyles.BarChart.data }} data={this.state.data} />
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
        padding={victoryStyles.LineChart.padding}
      >
        <VictoryScatter
          size={victoryStyles.ScatterChart.size}
          style={{ data: victoryStyles.ScatterChart.data }}
          data={this.state.data}
        />
        <VictoryLine style={{ data: victoryStyles.LineChart.data }} data={this.state.data} />
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
        labelComponent={
          <VictoryLabel
            style={{
              fontFamily: victoryStyles.PieChart.labelFontFamily,
              fill: victoryStyles.PieChart.labelFill,
            }}
          />
        }
        labelRadius={victoryStyles.PieChart.labelRadius}
        innerRadius={victoryStyles.PieChart.innerRadius}
        padAngle={victoryStyles.PieChart.padAngle}
        padding={victoryStyles.PieChart.padding}
        colorScale={victoryStyles.PieChart.colorScale}
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
      case 'Table':
        // TODO: table implementation.
        return null;
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
  BarChart: {
    padding: { top: 75, bottom: 75, left: 90, right: 60 },
    domainPadding: 50,
    fixLabelOverlap: true,
    axis: { stroke: LIGHT_GREY },
    ticks: { stroke: DARK_GREY },
    tickLabels: { fontFamily: APP_FONT_FAMILY, fill: GREY },
    data: { fill: SUSSOL_ORANGE },
  },
  ScatterChart: {
    size: 3.5,
    data: { fill: SUSSOL_ORANGE },
  },
  LineChart: {
    padding: { top: 75, bottom: 75, left: 90, right: 60 },
    domainPadding: 50,
    fixLabelOverlap: true,
    axis: { stroke: LIGHT_GREY },
    ticks: { stroke: DARK_GREY },
    tickLabels: { fontFamily: APP_FONT_FAMILY, fill: GREY },
    data: { stroke: SUSSOL_ORANGE },
  },
  PieChart: {
    labelFontFamily: APP_FONT_FAMILY,
    labelFill: GREY,
    labelRadius: 325,
    innerRadius: 200,
    padAngle: 2.5,
    padding: 75,
    colorScale: 'warm',
  },
};
