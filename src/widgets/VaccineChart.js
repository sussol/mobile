/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import { VictoryLine, VictoryScatter, VictoryChart, VictoryTheme } from 'victory-native';

export class VaccineChart extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { data, width, height } = this.props;

    console.log(width);

    data.forEach(line => {
      line.forEach(datum => {
        datum.symbol = datum.isBreach ? 'diamond' : 'circle';
      });
    });

    const linePlots = data.map(line => <VictoryLine data={line} x="date" y="temp" />);
    //const scatterPlots = lines.map(line => <VictoryScatter data={line} x="date" y="temp" />);

    return (
      <VictoryChart width={width} height={height} style={chartStyles} theme={VictoryTheme.material}>
        {linePlots}
      </VictoryChart>
    );
  };
}

const chartStyles = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
};

export default VaccineChart;
