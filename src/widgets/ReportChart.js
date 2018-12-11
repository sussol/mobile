/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine } from 'victory-native';
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
        return <VictoryBar style={victoryStyles.BarChart} data={this.state.data} />;
      case 'PieChart':
        // TODO: pie chart implementation.
        return null;
      case 'LineChart':
        return <VictoryLine style={victoryStyles.LineChart} data={this.state.data} />;
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
    return (
      <VictoryChart width={this.state.width} height={this.state.height} domainPadding={50}>
        {this.getChart()}
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
  }
}

const victoryStyles = {
  BarChart: { data: { fill: SUSSOL_ORANGE } },
  LineChart: { data: { stroke: SUSSOL_ORANGE } },
};
