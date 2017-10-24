/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, FlatList } from 'react-native';
import globalStyles from '../../globalStyles';
import { REPORTS } from './reports';
// import { CHARTS } from './charts';

export class ReportsDashboardPage extends React.PureComponent {
  state = { selectedReports: new Map() };

  onSelectReport = key => {
    this.setState(state => {
      const selectedReports = new Map(state.selectedReports);
      selectedReports.set(key, !selectedReports.get(key)); // toggle
      return { selectedReports };
    });
  };

  onPressReport = key => {
    this.props.navigateTo(key, key);
  };

  renderItem = ({ item: report }) => ( // eslint-disable-line react/prop-types
    <View style={{ width: 100, height: 40 }}>
      <Text>
        {report.key} {report.page}
      </Text>
    </View>
  );

  renderReportList = () => (
    <FlatList data={REPORTS} extraData={this.state.selectedReports} renderItem={this.renderItem} />
  );

  render() {
    return <View style={globalStyles.pageContentContainer}>{this.renderReportList()}</View>;
  }
}

ReportsDashboardPage.propTypes = {
  database: PropTypes.object,
  navigateTo: PropTypes.func.isRequired,
  topRoute: PropTypes.bool,
};
