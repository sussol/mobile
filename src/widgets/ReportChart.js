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
    // TODO: handle other chart types.
    switch (this.state.type) {
      case 'BarChart':
        return <VictoryBar data={this.state.data} />;
    }
  }

  render() {
    return (
      <VictoryChart width={this.state.width} height={this.state.height}>
        {this.getChart()}
      </VictoryChart>
    );
  }
}
