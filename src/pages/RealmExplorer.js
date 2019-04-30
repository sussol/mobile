/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { Cell, DataTable, Header, HeaderCell, Row } from 'react-native-data-table';

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
 *
 * @prop   {Realm}                database    App wide database.
 * @state  {ListView.DataSource}  dataSource  DataTable input, used to update rows being rendered.
 * @state  {Realm.Results}        data        Holds the data that gets put into the dataSource.
 */
export class RealmExplorer extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      data: null,
      dataSource,
    };
    this.unfilteredData = null;
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentWillMount() {
    const { database } = this.props;
    const { dataSource } = this.state;

    const data = database.objects('User');
    this.setState({
      data,
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  onFilterChange(filterString) {
    const { dataSource } = this.state;

    if (!this.unfilteredData) return;

    let data = null;
    if (filterString === '') {
      // if filter is emptied, clear filter.
      data = this.unfilteredData;
    } else {
      try {
        // Use |this.unfilteredData| to avoid stacking filters.
        data = this.unfilteredData.filtered(filterString);
      } catch (err) {
        // Ignore error silently.
      }
    }

    if (data) {
      this.setState({
        data,
        dataSource: dataSource.cloneWithRows(data),
      });
    }
  }

  onSearchChange(searchTerm) {
    const { database } = this.props;
    const { dataSource } = this.state;

    if (OBJECT_TYPES.indexOf(searchTerm) < 0) return;
    const data = database.objects(searchTerm);
    this.unfilteredData = data;
    this.setState({
      data,
      dataSource: dataSource.cloneWithRows(data),
    });
  }

  renderHeader() {
    const { data } = this.state;

    const headerCells = [];
    if (data && data.length > 0) {
      const firstObject = data[0];

      // TODO: use explicit loops instead of generators.
      // eslint-disable-next-line no-restricted-syntax
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
    return <Header style={globalStyles.header}>{headerCells}</Header>;
  }

  renderRow(item) {
    const { data } = this.state;
    const cells = [];
    if (data && data.length > 0) {
      const firstObject = data[0];

      const objects = Object.entries(firstObject);

      // TODO: use explicit loops instead of generators.
      // eslint-disable-next-line no-restricted-syntax
      for (const [key] of objects) {
        let itemString =
          item[key] &&
          (typeof item[key] === 'string' ||
            typeof item[key] === 'number' ||
            typeof item[key].getMonth === 'function') &&
          String(item[key]);
        if (!itemString && item[key] && item[key].length) {
          itemString = item[key].length;
        }
        if (typeof item[key] === 'boolean') {
          itemString = item[key] ? 'True' : 'False';
        }
        if (!itemString && item[key] && item[key].id) itemString = item[key].id;
        cells.push(
          <Cell key={key} style={globalStyles.cell} textStyle={globalStyles.text} width={1}>
            {itemString}
          </Cell>
        );
      }
    }
    return <Row style={globalStyles.row}>{cells}</Row>;
  }

  render() {
    const { dataSource } = this.state;

    return (
      <View style={[globalStyles.container]}>
        <SearchBar onChange={this.onSearchChange} placeholder="Table Name" />
        <SearchBar onChange={this.onFilterChange} placeholder="Filter" />
        <DataTable
          style={globalStyles.container}
          listViewStyle={globalStyles.container}
          dataSource={dataSource}
          renderRow={this.renderRow}
          renderHeader={this.renderHeader}
        />
      </View>
    );
  }
}

export default RealmExplorer;

RealmExplorer.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  database: PropTypes.object.isRequired,
};
