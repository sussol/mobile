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
    const maxTempLine = [
      { date: 'Feb 23', temp: 6, isBreach: false },
      { date: '24', temp: 6.4, isBreach: true },
      { date: '25', temp: 7, isBreach: false },
      { date: '26', temp: 7.4, isBreach: true },
    ];

    const minTempLine = [
      { date: 'Feb 23', temp: 3, isBreach: false },
      { date: '24', temp: 3.4, isBreach: true },
      { date: '25', temp: 4, isBreach: false },
      { date: '26', temp: 4.4, isBreach: true },
    ];

    const chartFunction = (width, height) => (
      <VaccineChart data={[maxTempLine, minTempLine]} width={width} height={height} />
    );

    return (
      <View style={chartContainer}>
        <View style={flexRowTop}>
          <ChartWrapper chartFunction={chartFunction} />
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

{
  /* <View style={flexRowBottom}>
<View style={flexColumnBottomLeft}>
  <VaccineChart lines={lines} width={width * 0.4} height={height * 0.4} />
</View>
<View style={flexColumnBottomRight}>
  <VaccineChart lines={lines} width={width * 0.4} height={height * 0.4} />
</View>
</View> */
}

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
