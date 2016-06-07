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
      data: null,
      dataSource: dataSource,
    };
    this.onSearchChange = this.onSearchChange.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const data = this.props.database.objects('User');
    this.setState({
      data: data,
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  onSearchChange(event) {
    const term = event.nativeEvent.text;
    if (OBJECT_TYPES.indexOf(term) < 0) return;
    const data = this.props.database.objects(term);
    this.setState({
      data: data,
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  renderHeader() {
    const headerCells = [];
    if (this.state.data && this.state.data.length > 0) {
      const firstObject = this.state.data[0];
      for (let field in firstObject) {
        if (firstObject.hasOwnProperty(field)) {
          headerCells.push(
            <HeaderCell
              key={field}
              style={globalStyles.headerCell}
              textStyle={globalStyles.text}
              width={1}
              text={field}
            />
          );
        }
      }
    }
    return (
      <Header style={globalStyles.header}>
        {headerCells}
      </Header>
    );
  }

  renderRow(item) {
    const cells = [];
    if (this.state.data && this.state.data.length > 0) {
      const firstObject = this.state.data[0];
      for (const field in firstObject) {
        if (firstObject.hasOwnProperty(field)) {
          cells.push(
            <Cell
              key={field}
              style={globalStyles.cell}
              textStyle={globalStyles.text}
              width={1}
            >
              {(typeof item[field] === 'string') && item[field]}
            </Cell>
          );
        }
      }
    }
    return (
      <Row style={globalStyles.row}>
        {cells}
      </Row>
    );
  }

  render() {
    return (
      <View style={[globalStyles.container, this.props.style]}>
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
