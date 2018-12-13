/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { ReportChart } from '../widgets';
import { ReportTable } from '../widgets/ReportTable';
import { ReportSidebar } from '../widgets/ReportSidebar';
import globalStyles from '../globalStyles';
import { testData } from './DashboardTestData'; // REMOVE THIS AND THE FILE DashboardTestData :)

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

  onLayout = event => {
    this.setState({
      chartWidth: event.nativeEvent.layout.width,
      chartHeight: event.nativeEvent.layout.height,
    });
  };

  renderVisualisation() {
    const report = this.state.reports ? this.state.reports[this.state.selected] : null;
    if (report === null) return null;
    switch (report.type) {
      case 'Table':
        return <ReportTable rows={report.data.rows} headers={report.data.header} />;
      default:
        return (
          <ReportChart
            title={report.title}
            type={report.type}
            data={report.data}
            width={this.state.chartWidth}
            height={this.state.chartHeight}
            id={report.id}
          />
        );
    }
  }

  render() {
    // TODO: handle initialisation gracefully.
    if (!this.state.reports) return null;
    const sideBarDimensions = { width: '25%', height: '100%' };
    return (
      <View style={globalStyles.pageContentContainer}>
        <View style={globalStyles.container}>
          <View style={[globalStyles.pageTopSectionContainer, { paddingHorizontal: 0 }]}>
            <ReportSidebar
              data={this.state.reports}
              onPressItem={this.onPressItem}
              selected={this.state.selected}
              dimensions={sideBarDimensions}
            />
            <View style={localStyles.ChartContainer} onLayout={this.onLayout}>
              {this.renderVisualisation()}
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
  ChartContainer: {
    width: '75%',
    minHeight: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
