import React from 'react';
import { View, FlatList, Text } from 'react-native';

export class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      reports: props.database
        .objects('Name')
        .snapshot()
        .map(name => {
          return { key: name.id, data: name.name };
        }),
      isDisplayingChart: false,
    };
  }

  render() {
    return (
      <View>
        <FlatList data={this.state.reports} renderItem={({ item }) => <Text>{item.data}</Text>} />
      </View>
    );
  }
}
