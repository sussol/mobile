/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ReportSideBar } from '../widgets/ReportSideBar';
import { ReportChart } from '../widgets/ReportChart';

import globalStyles from '../globalStyles';
import { DashboardActions } from '../actions/index';

const DashboardPageComponent = ({ reports, currentReport, switchReport }) => {
  const { pageContentContainer, container, pageTopSectionContainer } = globalStyles;
  const pageContainer = StyleSheet.flatten([pageTopSectionContainer, { paddingHorizontal: 0 }]);

  return (
    <View style={pageContentContainer}>
      <View style={container}>
        <View style={pageContainer}>
          <ReportSideBar
            reports={reports}
            onPressItem={switchReport}
            currentReport={currentReport}
            dimensions={localStyles.sidebarDimensions}
          />
          <ReportChart report={currentReport} />
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

const mapStateToProps = state => {
  const { dashboard } = state;
  const { reports, currentReport } = dashboard;
  return { reports, currentReport };
};

const mapDispatchToProps = dispatch => {
  const switchReport = report => dispatch(DashboardActions.switchReport(report));
  return { dispatch, switchReport };
};

DashboardPageComponent.defaultProps = {
  currentReport: null,
};

DashboardPageComponent.propTypes = {
  reports: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  currentReport: PropTypes.object,
  switchReport: PropTypes.func.isRequired,
};

export const DashboardPage = connect(mapStateToProps, mapDispatchToProps)(DashboardPageComponent);
