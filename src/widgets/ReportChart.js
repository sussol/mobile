/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine, VictoryPie } from 'victory-native';
import { SUSSOL_ORANGE } from '../globalStyles';

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
          <VictoryChart width={this.state.width} height={this.state.height} domainPadding={50}>
            <VictoryBar style={victoryStyles.BarChart} data={this.state.data} />
            <VictoryAxis
              style={{
                axis: { stroke: SUSSOL_ORANGE },
                ticks: { stroke: SUSSOL_ORANGE },
                tickLabels: { stroke: SUSSOL_ORANGE },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: SUSSOL_ORANGE },
                ticks: { stroke: SUSSOL_ORANGE },
                tickLabels: { stroke: SUSSOL_ORANGE },
              }}
            />
          </VictoryChart>
        );
      case 'PieChart':
        return (
          <VictoryPie
            width={this.state.width}
            height={this.state.height}
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
          <VictoryChart width={this.state.width} height={this.state.height} domainPadding={50}>
            <VictoryLine style={victoryStyles.LineChart} data={this.state.data} />
            <VictoryAxis
              style={{
                axis: { stroke: SUSSOL_ORANGE },
                ticks: { stroke: SUSSOL_ORANGE },
                tickLabels: { stroke: SUSSOL_ORANGE },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: SUSSOL_ORANGE },
                ticks: { stroke: SUSSOL_ORANGE },
                tickLabels: { stroke: SUSSOL_ORANGE },
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
  BarChart: { data: { fill: SUSSOL_ORANGE } },
  LineChart: { data: { stroke: SUSSOL_ORANGE } },
  PieChart: { labelRadius: 325, innerRadius: 200, padAngle: 2.5, padding: 75, colorScale: 'warm' },
};
