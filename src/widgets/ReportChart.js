/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { VictoryBar, VictoryChart } from 'victory-native';

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
        return <VictoryBar data={this.state.data} />;
      case 'PieChart':
        // TODO: pie chart implementation.
        return null;
      case 'LineChart':
        // TODO: line chart implementation.
        return null;
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
      </VictoryChart>
    );
  }
}
