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

const reportTable = [
  {
    ID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    storeID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB',
    reportID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC',
    title: 'Cumulative Expiring Stock',
    type: 'LineChart',
    data: [
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
    ID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD',
    storeID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE',
    reportID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF',
    title: "Yangon Warehouse's Transactions of the Month",
    type: 'BarChart',
    data: [
      { y: 150, x: 'Purchased orders' },
      { y: 50, x: 'Goods Received Notes' },
      { y: 100, x: 'Supplier invoices' },
      { y: 300, x: 'Customer Invoices' },
    ],
  },
  {
    ID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG',
    storeID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH',
    reportID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI',
    title: 'Last Sync Connection Date',
    type: 'Table',
    data: {
      header: ['SITE', 'LAST CONNECTION DATE'],
      rows: [
        ['Thazin Orchid Clinic', '09/11/2018'],
        ['Lotus Clinic', '09/11/2018'],
        ['Taungoo', '08/11/2018'],
        ['Mawlamyaing', '07/11/2018'],
        ['Yangon Warehouse', '09/11/2018'],
        ['Shwe Pyi Tha Clinic', '09/11/2018'],
        ['Bk Kee Clinic', '09/11/2018'],
        ['Brewery Clinic', '09/11/2018'],
        ['Rose Clinic', '08/11/2018'],
        ['KyaikDon', '05/10/2018'],
        ['Kyarin Seik Gyi', '08/11/2018'],
        ['Kyarin Seik Gyi Clinic', '11/11/2018'],
        ['Lily Clinic', '09/11/2018'],
        ['Yae', '10/11/2018'],
        ['Myit Kyi Na', '09/11/2018'],
        ['Phakcl', '06/11/2018'],
        ['Phakof', '09/11/2018'],
        ['Put Of', '09/11/2018'],
        ['Put Cl', '09/11/2018'],
        ['Kal', '11/11/2018'],
        ['Hkam', '08/11/2018'],
        ['Kyauk', '07/11/2018'],
        ['Loikaw', '08/11/2018'],
        ['Nan Yun', '01/11/2018'],
      ],
    },
  },
  {
    ID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJ',
    storeID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK',
    reportID: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL',
    title: "Yangon Warehouse's Transactions of the Month",
    type: 'PieChart',
    data: [
      { y: 150, x: 'Purchased orders' },
      { y: 50, x: 'Goods Received Notes' },
      { y: 100, x: 'Supplier invoices' },
      { y: 300, x: 'Customer Invoices' },
    ],
  },
];

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
    const reports = reportTable.map((report, index) => {
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
    // TODO: handle initialisation gracefully.
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
