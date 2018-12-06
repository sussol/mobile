import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';
import globalStyles, {
  APP_FONT_FAMILY,
  SHADOW_BORDER,
  GREY,
  WARMER_GREY,
  verticalContainer,
  pageStyles,
} from '../globalStyles';

export class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      reportNames: this.reports.map(report => {
        console.log(report.name);
        return { key: report.name + 'abc', data: report.name };
      }),
      isDisplayingChart: false,
    };
  }

  onSelection = id => {
    this.setState({ selected: id });
  };

  renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={this.onSelection}>
        <Text>{item.data}</Text>
      </TouchableOpacity>
    );
  };

  extractKey = item => {
    return item.key;
  };

  render() {
    return (
      <View style={pageStyles.container}>
        <View style={localStyles.ListViewContainer}>
          <View style={pageStyles.verticalContainer}>
            <FlatList
              data={this.state.reportNames}
              renderItem={this.renderItem}
              extraData={this.state}
              keyExtractor={this.extractKey}
            />
          </View>
        </View>
      </View>
    );
  }

  reports = [
    {
      data: [
        {
          label: 'Cumulative',
          values: [
            { y: 502, x: '1 month' },
            { y: 3070.48, x: '2 months' },
            { y: 48340.11, x: '3 months' },
            { y: 5523584.94, x: '4 months' },
            { y: 5524852.94, x: '5 months' },
            { y: 5528284.62, x: '6 months' },
            { y: 5528529.9, x: '7 months' },
            { y: 5530152.3, x: '8 months' },
            { y: 5531957.72, x: '9 months' },
            { y: 5579548.22, x: '10 months' },
            { y: 5606846.66, x: '11 months' },
            { y: 5611265.45, x: '12 months' },
          ],
        },
        {
          label: 'Monthly',
          values: [
            { y: 502, x: '1 month' },
            { y: 2568.48, x: '2 months' },
            { y: 45269.63, x: '3 months' },
            { y: 5475244.83, x: '4 months' },
            { y: 1268, x: '5 months' },
            { y: 3431.68, x: '6 months' },
            { y: 245.28, x: '7 months' },
            { y: 1622.4, x: '8 months' },
            { y: 1805.42, x: '9 months' },
            { y: 47590.5, x: '10 months' },
            { y: 27298.44, x: '11 months' },
            { y: 4418.79, x: '12 months' },
          ],
        },
      ],
      name: 'ExpiringStock',
    },
    {
      data: [
        {
          label: "Yangon warehouse's transactions of the month",
          values: [
            { y: 0, x: 'Purchased orders' },
            { y: 0, x: 'Goods Received Notes' },
            { y: 0, x: 'Supplier invoices' },
            { y: 0, x: 'Customer Invoices' },
          ],
        },
      ],
      name: 'Month_Transacs',
    },
  ];
}

DashboardPage.propTypes = {
  database: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  ListViewContainer: {
    marginLeft: 20,

    marginVertical: 30,
    width: '20%',
  },
});
