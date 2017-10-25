/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import globalStyles, { dataTableStyles, dataTableColors } from '../../globalStyles';
import { REPORTS } from './reports';
// import { CHARTS } from './charts';

export class ReportsDashboardPage extends React.PureComponent {
  state = { selectedReports: new Map() };

  onSelectReport = name => {
    this.setState(state => {
      const selectedReports = new Map(state.selectedReports);
      selectedReports.set(name, !selectedReports.get(name)); // toggle
      return { selectedReports };
    });
  };

  onPressReport = name => {
    this.props.navigateTo(name, name);
  };

  renderItem = (
    { item: report }, // eslint-disable-line react/prop-types
  ) => (
    <TouchableOpacity style={localStyles.row} onPress={() => this.onPressReport(report.name)}>
      <View style={[dataTableStyles.checkableCell, { flex: 3 }]}>
        <Text style={globalStyles.text}>{report.name}</Text>
      </View>
      <TouchableOpacity
        style={[dataTableStyles.checkableCell, { flex: 1 }]}
        onPress={() => this.onSelectReport(report.name)}
      >
        {this.state.selectedReports.get(report.name) ? (
          <Icon
            name={'md-radio-button-on'}
            size={15}
            color={dataTableColors.checkableCellChecked}
          />
        ) : (
          <Icon
            name={'md-radio-button-off'}
            size={15}
            color={dataTableColors.checkableCellUnchecked}
          />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  render() {
    return (
      <View style={globalStyles.pageContentContainer}>
        <FlatList
          style={{ width: 100 }}
          data={REPORTS}
          selectedReports={this.state.selectedReports}
          renderItem={this.renderItem}
          keyExtractor={item => item.name}
        />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    height: 40,
  },
});

ReportsDashboardPage.propTypes = {
  database: PropTypes.object,
  navigateTo: PropTypes.func.isRequired,
  topRoute: PropTypes.bool,
};
