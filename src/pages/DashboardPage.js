import React from 'react';
import { View, Text } from 'react-native';
import { VictoryBar } from 'victory-native';

export class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <VictoryBar/>
    );
  }
}
