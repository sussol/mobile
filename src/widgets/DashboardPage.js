/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import globalStyles from '../globalStyles';
import { testData } from '../database/utilities/ReportDemoData';
import { ReportSideBar } from './ReportSideBar';
import { ReportChart } from './ReportChart';
import { createOrUpdateRecord } from '../sync/incomingSyncUtils';

export const DashboardPage = ({ database, settings }) => {
  const [reports, setReports] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // Used for adding data within ./ReportDemoData to the database for
  // testing while syncing from mobile is not functional.
  database.write(() =>
    testData.forEach(report => {
      const recordCopy = { ...report };
      recordCopy.data = JSON.stringify(report.data);
      createOrUpdateRecord(database, settings, 'Report', recordCopy);
    })
  );

  useEffect(() => {
    setReports(
      database
        .objects('Report')
        .snapshot()
        .map((report, index) => ({
          id: report.reportID,
          index,
          title: report.title,
          type: report.type,
          date: report.date,
          data: JSON.parse(report.data),
        }))
    );
  });

  const onPressItem = id => {
    if (selectedItemIndex === id) return;
    setSelectedItemIndex(id);
  };

  const { pageContentContainer, container, pageTopSectionContainer } = globalStyles;
  const pageContainer = StyleSheet.flatten([pageTopSectionContainer, { paddingHorizontal: 0 }]);

  if (!reports) return null;
  const report = reports ? reports[selectedItemIndex] : null;
  return (
    <View style={pageContentContainer}>
      <View style={container}>
        <View style={pageContainer}>
          <ReportSideBar
            data={reports}
            onPressItem={onPressItem}
            selectedItemIndex={selectedItemIndex}
            dimensions={localStyles.sidebarDimensions}
          />
          <ReportChart report={report} />
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  sidebarDimensions: {
    width: '25%',
    height: '100%',
  },
});

DashboardPage.propTypes = {
  database: PropTypes.objectOf(PropTypes.object()).isRequired,
  settings: PropTypes.objectOf(PropTypes.object()).isRequired,
};
