/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { ReportChart } from '../widgets';
import { ReportSidebar } from '../widgets/ReportSidebar';
import globalStyles from '../globalStyles';
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
      selectedItemIndex: 0,
      reports: null,
    };
    // Used for adding data within ./DashboardTestData to the database for
    // testing while syncing from mobile is not functional.
    // Add more data to testData if needed.
    props.database.write(() =>
      testData.forEach(report => {
        const recordCopy = { ...report };
        recordCopy.data = JSON.stringify(report.data);
        createOrUpdateRecord(props.database, props.settings, 'Report', recordCopy);
      }),
    );
  }

  componentDidMount() {
    const { database } = this.state;
    // Creating a snapshot and storing this in state, should prevent
    // the page from updating if a sync occurs.
    const reports = database
      .objects('Report')
      .snapshot()
      .map((report, index) => {
        return {
          id: report.reportID,
          index: index,
          title: report.title,
          type: report.type,
          date: report.date,
          data: JSON.parse(report.data),
        };
      });
    this.setState({
      reports: reports,
    });
  }

  onPressItem = id => {
    if (this.state.selectedItemIndex === id) return;
    this.setState({ selectedItemIndex: id });
  };

  render() {
    const { reports, selectedItemIndex } = this.state;
    const { pageContentContainer, container, pageTopSectionContainer } = globalStyles;
    const pageContainer = StyleSheet.flatten([pageTopSectionContainer, { paddingHorizontal: 0 }]);

    if (!reports) return null;
    const report = reports ? reports[selectedItemIndex] : null;
    return (
      <View style={pageContentContainer}>
        <View style={container}>
          <View style={pageContainer}>
            <ReportSidebar
              data={reports}
              onPressItem={this.onPressItem}
              selectedItemIndex={selectedItemIndex}
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
  sidebarDimensions: {
    width: '25%',
    height: '100%',
  },
});
