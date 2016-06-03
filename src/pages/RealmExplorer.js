/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  View,
} from 'react-native';

import {
  Cell,
  DataTable,
  Header,
  HeaderCell,
  Row,
} from '../widgets/DataTable';

import { ListView } from 'realm/react-native';

import globalStyles from '../globalStyles';

const OBJECT_TYPES = [
  'Address',
  'Item',
  'ItemLine',
  'ItemDepartment',
  'ItemCategory',
  'Transaction',
  'TransactionLine',
  'TransactionCategory',
  'MasterList',
  'MasterListLine',
  'Name',
  'Requisition',
  'RequisitionLine',
  'Setting',
  'SyncOut',
  'Stocktake',
  'StocktakeLine',
  'User',
];

export class RealmExplorer extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource,
    };
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  componentWillMount() {
    const data = this.props.database.objects('Name');
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    if (OBJECT_TYPES.indexOf(term) < 0) return;
    const data = this.props.database.objects(term);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  renderHeader() {
    return (
      <Header style={globalStyles.header}>
        <HeaderCell
          style={globalStyles.headerCell}
          textStyle={globalStyles.text}
          width={1}
          text={'Id'}
        />
      </Header>
    );
  }

  renderRow(item) {
    return (
      <Row style={globalStyles.row} renderExpansion={() => this.renderExpansion(item)}>
        <Cell
          style={globalStyles.cell}
          textStyle={globalStyles.text}
          width={1}
        >
          {item.id}
        </Cell>
      </Row>
    );
  }

  render() {
    return (
      <View style={this.props.style}>
        <DataTable
          style={globalStyles.container}
          listViewStyle={globalStyles.container}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
          searchBar={this.onSearchChange}
          searchBarStyle={globalStyles.searchBar}
        />
      </View>
    );
  }
}

RealmExplorer.propTypes = {
  database: React.PropTypes.object.isRequired,
  navigateTo: React.PropTypes.func.isRequired,
  style: View.propTypes.style,
};
