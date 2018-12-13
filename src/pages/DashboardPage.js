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

//TODO: Alter database/sync logic when schema is locked in.
// Includes:
// sync/incomingSyncUtils.js :: createOrUpdateRecord, sanityCheckIncomingRecord
// database/DataTypes/index.js
// database/schema.js :: import list, Report.schema, export list
// ./DashboardTestData.js -- delete
// DashboardPage.js :: componentDidMount, constructor
export class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      database: props.database,
      selected: 0,
      reports: null,
      loading: true,
      error: null,
    };

    // Used for adding data within ./DashboardTestData to the database for
    // testing while syncing from mobile is not functional.
    // Add more data to testData if needed.
    props.database.write(() =>
      testData.forEach(report => {
        createOrUpdateRecord(props.database, props.settings, 'Report', report);
      }),
    );
  }

  componentDidMount() {
    const { database } = this.state;
    // Creating a snapshot and storing this in state, should prevent
    // the page from updating if a sync occurs. This is the desired behaviour.
    const reports = database
      .objects('Report')
      .snapshot()
      .map((report, index) => {
        return {
          id: report.reportID,
          index: index,
          title: report.title,
          type: report.type,
          data: JSON.parse(report.data),
          //this will be report generated date at some point?
          date: new Date().toDateString(),
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
    const { reports, selected } = this.state;
    if (!reports) return null;
    const report = reports ? reports[selected] : null;
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={[globalStyles.pageTopSectionContainer, { paddingHorizontal: 0 }]}>
            <ReportSidebar
              data={reports}
              onPressItem={this.onPressItem}
              selected={selected}
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
