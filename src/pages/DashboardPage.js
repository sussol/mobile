import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { buttonStrings, modalStrings, navStrings, tableStrings } from '../localization';
import { ListItem } from '../widgets/ListItem';
import globalStyles, { APP_FONT_FAMILY, GREY } from '../globalStyles';

export class DashboardPage extends React.Component {
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
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      reportNames: null,
      loading: true,
      error: null,
    };
  }
  componentDidMount() {
    // call database here.
    const reportNames = this.reports.map((report, index) => {
      return { name: report.name, label: report.data[0].label, date: '7/12/2018', id: index };
    });
    this.setState({ reportNames: reportNames });
  }

  onPressItem = id => {
    if (this.state.selected === id) return;
    this.setState({ selected: id });
  };

  renderItem = ({ item }) => {
    return (
      <ListItem
        name={item.name}
        date={item.date}
        label={item.label}
        id={item.id}
        onPress={this.onPressItem}
        numReports={this.state.reportNames ? this.state.reportNames.length : 0}
        selected={this.state.selected === item.id ? true : false}
      />
    );
  };

  renderHeader = () => {
    return (
      <View>
        <Text style={localStyles.ListViewHeader}>Reports</Text>
      </View>
    );
  };

  //TODO: Change to reportID once db is setup.
  extractKey = item => {
    return item.id;
  };

  //
  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={localStyles.ListViewContainer}>
              <FlatList
                data={this.state.reportNames}
                renderItem={this.renderItem}
                extraData={this.state}
                keyExtractor={this.extractKey}
                ListHeaderComponent={this.renderHeader}
              />
            </View>
            <View style={localStyles.ChartContainer}>
              <Text>
                {this.state.reportNames ? this.state.reportNames[this.state.selected].name : null}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

DashboardPage.propTypes = {
  database: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  genericTablePageStyles: PropTypes.object,
  topRoute: PropTypes.bool,
  navigateTo: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  Black: {
    backgroundColor: 'black',
  },
  ListViewContainer: {
    backgroundColor: 'white',
    width: '20%',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRightColor: GREY,
    borderRightWidth: 1,
    height: '100%',
    margin: 0,
  },
  ChartContainer: {
    width: '80%',
    minHeight: '100%',
    backgroundColor: 'white',
    alignItems: 'flex-start',
  },
  ListViewHeader: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 18,
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 5,
    color: GREY,
  },
});
