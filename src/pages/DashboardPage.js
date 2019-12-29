/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { ReportSideBar } from '../widgets/ReportSideBar';
import { ReportChart } from '../widgets/ReportChart';

import { UIDatabase } from '../database/index';

import globalStyles from '../globalStyles';

export const DashboardPage = () => {
  const [reports] = useState(UIDatabase.objects('Report'));
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

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
