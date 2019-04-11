/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View } from 'react-native';

import { ChartWrapper } from '../widgets/ChartWrapper';
import { VaccineChart } from '../widgets/VaccineChart';

console.disableYellowBox = true;

// eslint-disable-next-line react/prefer-stateless-function
export class VaccineChartPage extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  render() {
    const eventHandler = () => {
      console.log('CLICKED');
    };

    const maxTempLine = {
      data: [
        { date: 'Feb 23', temp: 6 },
        { date: '24', temp: 6.4 },
        { date: '25', temp: 7 },
        { date: '26', temp: 7.4 },
      ],
      color: 'red',
      eventHandler,
    };

    const minTempLine = {
      data: [
        { date: 'Feb 23', temp: 3 },
        { date: '24', temp: 3.5 },
        { date: '25', temp: 1 },
        { date: '26', temp: 4 },
      ],
      color: 'blue',
      eventHandler,
    };

    const chartFunction = (width, height) => (
      <VaccineChart
        lines={[maxTempLine, minTempLine]}
        maxTemp={6}
        minTemp={3}
        width={width}
        height={height}
      />
    );

    return (
      <View style={chartContainer}>
        <View style={flexRowTop}>
          <ChartWrapper chartFunction={chartFunction} />
        </View>
        <View style={flexRowBottom}>
          <View style={flexColumnBottomLeft}>
            <ChartWrapper chartFunction={chartFunction} />
          </View>
          <View style={flexColumnBottomRight}>
            <ChartWrapper chartFunction={chartFunction} />
          </View>
        </View>
      </View>
    );
  }
}

const chartContainer = {
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
