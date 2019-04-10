/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';

import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';

console.disableYellowBox = true;

const data = [
  { quarter: 1, earnings: 13000 },
  { quarter: 2, earnings: 16500 },
  { quarter: 3, earnings: 14250 },
  { quarter: 4, earnings: 19000 },
];

export class VaccineChartPage extends React.Component {
  // Victory Native sizes are set using absolute values. Parents dimensions are used to
  // calculate relative values for width and height for each chart.
  constructor(props) {
    super(props);
    this.state = { width: null };
    // this.state = { width: null, height: null };
  }

  onLayout = event => {
    this.setState({
      width: event.nativeEvent.layout.width,
      // height: event.nativeEvent.layout.height,
    });
  };

  render = () => {
    const { width } = this.state;

    return (
      <View style={flexParent} onLayout={this.onLayout}>
        <View style={flexRowTop}>
          <VictoryChart width={width * 0.9} theme={VictoryTheme.material}>
            <VictoryBar data={data} x="quarter" y="earnings" />
          </VictoryChart>
        </View>
        <View style={flexRowBottom}>
          <View style={flexColumnBottomLeft}>
            <VictoryChart width={width * 0.4} theme={VictoryTheme.material}>
              <VictoryBar data={data} x="quarter" y="earnings" />
            </VictoryChart>
          </View>
          <View style={flexColumnBottomRight}>
            <VictoryChart width={width * 0.4} theme={VictoryTheme.material}>
              <VictoryBar data={data} x="quarter" y="earnings" />
            </VictoryChart>
          </View>
        </View>
      </View>
    );
  };
}

const flexParent = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  borderWidth: 1,
  borderColor: 'black',
};

const flexRowTop = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
  height: '50%',
  borderWidth: 1,
  borderColor: 'black',
};

const flexRowBottom = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '50%',
  borderWidth: 1,
  borderColor: 'black',
};

const flexColumnBottomLeft = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '50%',
  height: '100%',
  borderWidth: 1,
  borderColor: 'black',
};

const flexColumnBottomRight = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '50%',
  height: '100%',
  borderWidth: 1,
  borderColor: 'black',
};

export default VaccineChartPage;
