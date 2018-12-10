/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { VictoryBar } from 'victory-native';

export default class ReportChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...props };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...nextProps });
  }

  render() {
    switch (this.state.type) {
      // TODO: handle other chart types.
      case 'BarChart':
        return (
          <VictoryBar width={this.state.width} height={this.state.height} data={this.state.data} />
        );
    }
  }
}
