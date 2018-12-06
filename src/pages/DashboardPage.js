import React from 'react';
import { VictoryBar } from 'victory-native';
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
  DARK_GREY,
} from '../globalStyles';

export class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      reportNames: null,
      testData: 'test1',
      loading: true,
      error: null,
    };
  }

  // Handler for list item selection, should alter the state to trigger a re render, showing a new graph
  onSelection = (id, index) => {};

  // Potentially refactor into it's own ListItem/ReportItem/ListReportItem component
  renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={{ height: 80 }}>
        <View style={localStyles.ListViewItem}>
          <Text style={localStyles.ListViewItemTitle}>{item.name}</Text>
          <Text style={localStyles.ListViewItemLabel}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  //Extracts a unique key for the flatmap - using the name of the report currently?
  extractKey = item => {
    return item.name;
  };

  //renders a seperator component for between flatmap items, refactor into it's own reusable component?
  renderSeperator = highlighted => {
    return <View style={highlighted && { backgroundColor: GREY, height: 1 }} />;
  };

  componentDidMount() {
    // call database here.
    const reportNames = this.reports.map(report => {
      return { name: report.name, label: report.data[0].label };
    });
    this.setState({ reportNames: reportNames });
  }

  //Renders a header for the list, probably won't need to refactor this
  renderHeader = () => {
    return (
      <View>
        <Text style={localStyles.ListViewHeader}>Reports</Text>
      </View>
    );
  };

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={globalStyles.pageTopSectionContainer}>
            <View style={[localStyles.ListViewContainer, { minHeight: '100%' }]}>
              <FlatList
                data={this.state.reportNames}
                renderItem={this.renderItem}
                extraData={this.state}
                keyExtractor={this.extractKey}
                ItemSeparatorComponent={this.renderSeperator}
                ListHeaderComponent={this.renderHeader}
              />
            </View>
            <View style={[localStyles.ChartContainer]}>
              <Text>{this.state.testData}</Text>
            </View>
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
    backgroundColor: 'white',
    width: '20%',
    minHeight: '100%',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: WARMER_GREY,
  },
  ChartContainer: {
    backgroundColor: 'white',
    minWidth: '75%',
    minHeight: '100%',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: WARMER_GREY,
  },
  ListViewItem: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingLeft: 5,
  },
  ListViewItemTitle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  ListViewItemLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 10,
    color: WARMER_GREY,
  },
  ListViewHeader: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 18,
    marginVertical: 10,
    marginHorizontal: 14,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
});
