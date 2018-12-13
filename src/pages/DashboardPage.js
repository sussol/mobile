/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { ReportChart } from '../widgets';
import { ReportSidebar } from '../widgets/ReportSidebar';
import globalStyles, { GREY } from '../globalStyles';
import { testData } from './DashboardTestData'; // REMOVE THIS AND THE FILE DashboardTestData :)
import { createOrUpdateRecord } from '../sync/incomingSyncUtils';

export class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      reports: null,
      loading: true,
      error: null,
    };
    testData.forEach(x => {
      createOrUpdateRecord(props.database, props.settings, 'Report', x);
    });
  }

  componentDidMount() {
    console.log(this.props.database.objects('Report'));
    // call database here.
    // Creating a snapshot and storing this in state, should prevent
    // the page from updating if a sync occurs..?
    //const reports = database.objects('Report').snapshot();
    const reports = testData.map((report, index) => {
      return {
        id: report.reportID,
        index: index,
        title: report.title,
        type: report.type,
        data: report.data,
        date: new Date().toDateString(), //this will be report generated date at some point?
      };
    });
    this.setState({
      reports: reports,
    });
  }

  onPressItem = id => {
    if (this.state.selected === id) return;
    this.setState({ selected: id });
  };

  render() {
    if (!this.state.reports) return null;
    const report = this.state.reports ? this.state.reports[this.state.selected] : null;
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={[globalStyles.pageTopSectionContainer, { paddingHorizontal: 0 }]}>
            <ReportSidebar
              data={this.state.reports}
              onPressItem={this.onPressItem}
              selected={this.state.selected}
              dimensions={localStyles.sidebarDimensions}
            />
            <ReportChart report={report} />
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
  sidebarDimensions: {
    width: '25%',
    height: '100%',
  },
});
