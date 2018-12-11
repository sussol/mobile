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

  getChart() {
    switch (this.state.type) {
      case 'BarChart':
        return (
          <VictoryChart
            width={this.state.width}
            height={this.state.height}
            padding={victoryStyles.BarChart.padding}
            domainPadding={victoryStyles.BarChart.domainPadding}
          >
            <VictoryBar style={{ data: victoryStyles.BarChart.data }} data={this.state.data} />
            <VictoryAxis
              fixLabelOverlap={victoryStyles.BarChart.fixLabelOverlap}
              style={{
                axis: victoryStyles.BarChart.axis,
                ticks: victoryStyles.BarChart.ticks,
                tickLabels: victoryStyles.BarChart.tickLabels,
              }}
            />
            <VictoryAxis
              dependentAxis
              fixLabelOverlap={victoryStyles.BarChart.fixLabelOverlap}
              style={{
                axis: victoryStyles.BarChart.axis,
                ticks: victoryStyles.BarChart.ticks,
                tickLabels: victoryStyles.BarChart.tickLabels,
              }}
            />
          </VictoryChart>
        );
      case 'PieChart':
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
      case 'LineChart':
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
            <VictoryAxis
              fixLabelOverlap={victoryStyles.LineChart.fixLabelOverlap}
              style={{
                axis: victoryStyles.LineChart.axis,
                ticks: victoryStyles.LineChart.ticks,
                tickLabels: victoryStyles.LineChart.tickLabels,
              }}
            />
            <VictoryAxis
              dependentAxis
              fixLabelOverlap={victoryStyles.LineChart.fixLabelOverlap}
              style={{
                axis: victoryStyles.LineChart.axis,
                ticks: victoryStyles.LineChart.ticks,
                tickLabels: victoryStyles.LineChart.tickLabels,
              }}
            />
          </VictoryChart>
        );
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
    return this.getChart();
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
