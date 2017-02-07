/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  View,
} from 'react-native';

import { SearchBar } from 'react-native-ui-components';
import {
  Cell,
  DataTable,
  Header,
  HeaderCell,
  Row,
} from 'react-native-data-table';

import { ListView } from 'realm/react-native';

import globalStyles from '../globalStyles';

const OBJECT_TYPES = [
  'Address',
  'Item',
  'ItemBatch',
  'ItemDepartment',
  'ItemCategory',
  'ItemStoreJoin',
  'Transaction',
  'TransactionItem',
  'TransactionBatch',
  'TransactionCategory',
  'MasterList',
  'MasterListItem',
  'MasterListNameJoin',
  'Name',
  'NameStoreJoin',
  'NumberSequence',
  'NumberToReuse',
  'Requisition',
  'RequisitionItem',
  'Setting',
  'SyncOut',
  'Stocktake',
  'StocktakeItem',
  'StocktakeBatch',
  'User',
];

/**
* A page to explore the contents of the local database. Allows searching for any
* database object type, and will show the related data in a table.
* @prop   {Realm}               database      App wide database.
* @state  {ListView.DataSource} dataSource    DataTable input, used to update rows being rendered.
* @state  {Realm.Results}       data          Holds the data that get put into the dataSource
*/
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

  onSearchChange(searchTerm) {
    if (OBJECT_TYPES.indexOf(searchTerm) < 0) return;
    const data = this.props.database.objects(searchTerm);
    this.setState({
      data: data,
      dataSource: this.state.dataSource.cloneWithRows(data),
    });
  }

  renderHeader() {
    const headerCells = [];
    if (this.state.data && this.state.data.length > 0) {
      const firstObject = this.state.data[0];
      for (const [key] of Object.entries(firstObject)) {
        headerCells.push(
          <HeaderCell
            key={key}
            style={globalStyles.headerCell}
            textStyle={globalStyles.text}
            width={1}
            text={key}
          />
        );
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
      for (const [key] of Object.entries(firstObject)) {
        let itemString = item[key]
          && ((typeof item[key] === 'string')
          || (typeof item[key] === 'number')
          || (typeof item[key].getMonth === 'function'))
          && String(item[key]);
        if (!itemString && item[key] && item[key].length) itemString = item[key].length;
        if (typeof item[key] === 'boolean') itemString = item[key] ? 'True' : 'False';
        if (!itemString && item[key] && item[key].id) itemString = item[key].id;
        cells.push(
          <Cell
            key={key}
            style={globalStyles.cell}
            textStyle={globalStyles.text}
            width={1}
          >
            {itemString}
          </Cell>
        );
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
      <View style={[globalStyles.container]}>
        <SearchBar onChange={this.onSearchChange} />
        <DataTable
          style={globalStyles.container}
          listViewStyle={globalStyles.container}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
        />
      </View>
    );
  }
}

RealmExplorer.propTypes = {
  database: React.PropTypes.object.isRequired,
};
