import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { ListItem } from '../widgets/ListItem';
import globalStyles, { APP_FONT_FAMILY, GREY } from '../globalStyles';

const reportTable = [
  {
    ID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    storeID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB',
    reportID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC',
    title: 'ExpiringStock',
    label: 'Cumulative Expiring Stock',
    type: 'BarChart',
    data: [
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
    ID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD',
    storeID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE',
    reportID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF',
    title: 'MonthlyTransactions',
    label: "Yangon Warehouse's Transactions of the Month",
    type: 'BarChart',
    data: [
      { y: 150, x: 'Purchased orders' },
      { y: 50, x: 'Goods Received Notes' },
      { y: 100, x: 'Supplier invoices' },
      { y: 300, x: 'Customer Invoices' },
    ],
  },
];

export class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      reports: null,
      loading: true,
      error: null,
    };
  }
  componentDidMount() {
    // call database here.
    const reports = reportTable.map((report, index) => {
      return {
        id: index,
        reportID: report.reportID,
        title: report.title,
        label: report.label,
        type: report.type,
        date: new Date().toDateString(), //this will be report generated date at some point?
      };
    });
    this.setState({
      reports: reports,
    });
  }

  onPressItem = id => {
    // is this if needed? Will changing selected to the same value trigger a re-render?
    // set loading, display a spinner and then set state to selected?
    if (this.state.selected === id) return;
    this.setState({ selected: id });
  };

  renderItem = ({ item }) => {
    return (
      <ListItem
        id={item.id}
        reportID={item.reportID}
        title={item.title}
        date={item.date}
        label={item.label}
        onPress={this.onPressItem}
        numReports={this.state.reports ? this.state.reports.length : 0}
        selected={this.state.selected === item.id}
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

  extractKey = item => {
    return item.reportID;
  };

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={[globalStyles.pageTopSectionContainer, { paddingHorizontal: 0 }]}>
            <View style={localStyles.ListViewContainer}>
              <FlatList
                data={this.state.reports}
                renderItem={this.renderItem}
                extraData={this.state}
                keyExtractor={this.extractKey}
                ListHeaderComponent={this.renderHeader}
              />
            </View>
            <View style={localStyles.ChartContainer}>
              <Text>
                {this.state.reports ? this.state.reports[this.state.selected].title : null}
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
    //for testing blocks..
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
