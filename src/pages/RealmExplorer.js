/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import { Cell, DataTable, Header, HeaderCell, Row } from 'react-native-data-table';

import { ListView } from 'realm/react-native';

import globalStyles from '../globalStyles';
import { UIDatabase } from '../database/index';

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

const OBJECT_FIELDS = {
  Requisition: {
    id: 'string',
    status: 'string',
    thresholdMOS: 'number',
    type: 'string',
    entryDate: 'date',
    daysToSupply: 'number',
    serialNumber: 'string',
    requesterReference: 'string',
    comment: 'string',
    enteredBy: 'object',
    items: 'list',
    linkedTransaction: 'object',
    program: 'object',
    period: 'object',
    otherStoreName: 'object',
    CustomData: 'string',
  },
  Transaction: {
    id: 'string',
    serialNumber: 'string',
    otherParty: 'object',
    comment: 'string',
    entryDate: 'date',
    type: 'string',
    status: 'string',
    confirmDate: 'date',
    enteredBy: 'object',
    theirRef: 'string',
    category: 'object',
    items: 'list',
    linkedRequisition: 'object',
  },
};

const getColumnKeys = ({ databaseObject }) => OBJECT_FIELDS[databaseObject];

const toUpperCase = value => value.charAt(0).toUpperCase() + value.slice(1);

const parseCell = (value, type) => {
  if (value === null || value === undefined) return 'N/A';
  switch (type) {
    case 'string':
      return String(value);
    case 'number':
      return String(value);
    case 'object':
      return value.id;
    case 'list':
      return value.length;
    case 'boolean':
      return toUpperCase(String(value));
    case 'date':
      return value.toString();
    default:
      return '';
  }
};

/**
 * A page to explore the contents of the local database. Allows searching for any
 * database object type, and will show the related data in a table.
 *
 * @prop   {UIDatabase}           database       App wide database.
 * @state  {string}               databaseObject Currently selected object.
 * @state  {ListView.DataSource}  dataSource     DataTable input, used to update rows being
 *                                               rendered.
 * @state  {Realm.Results}        data           Holds the data that gets put into the dataSource.
 */
export const RealmExplorer = ({ database }) => {
  const initialState = {
    databaseObject: 'Requisition',
    data: database.objects('Requisition'),
    dataSource: new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    }),
    unfilteredData: null,
  };

  const [state, setState] = useState(initialState);

  const { databaseObject, data, dataSource, unfilteredData } = state;

  useEffect(() => {
    setState({
      databaseObject,
      data,
      dataSource: dataSource.cloneWithRows(data),
      unfilteredData: data,
    });
  }, []);

  const onFilterChange = filterString => {
    if (!unfilteredData) return;
    let updatedData = null;
    if (filterString === '') {
      updatedData = unfilteredData;
    } else {
      try {
        updatedData = unfilteredData.filtered(filterString);
      } catch (err) {
        // Silently ignore errors.
      }
    }
    if (updatedData) {
      setState({
        databaseObject,
        data: updatedData,
        dataSource: dataSource.cloneWithRows(updatedData),
        unfilteredData,
      });
    }
  };

  const onSearchChange = searchTerm => {
    if (OBJECT_TYPES.indexOf(searchTerm) < 0) return;
    const updatedData = database.objects(searchTerm);
    setState({
      databaseObject: searchTerm,
      data: updatedData,
      dataSource: dataSource.cloneWithRows(updatedData),
      unfilteredData: updatedData,
    });
  };

  const renderHeader = () => {
    if (data && data.length > 0) {
      const columnKeys = getColumnKeys(state);
      const headerCells = Object.keys(columnKeys).map(columnKey => (
        <HeaderCell
          key={columnKey}
          style={globalStyles.headerCell}
          textStyle={globalStyles.text}
          width={1}
          text={columnKey}
        />
      ));
      return <Header style={globalStyles.header}>{headerCells}</Header>;
    }
    return <Header style={globalStyles.header} />;
  };

  const renderRow = row => {
    const columnKeys = getColumnKeys(state);
    const cells = Object.entries(columnKeys).map(([columnKey, columnType]) => {
      const cell = row[columnKey];
      const cellValue = parseCell(cell, columnType);
      return (
        <Cell key={columnKey} style={globalStyles.cell} textStyle={globalStyles.text} width={1}>
          {cellValue}
        </Cell>
      );
    });
    return <Row style={globalStyles.row}>{cells}</Row>;
  };

  return (
    <View style={[globalStyles.container]}>
      <SearchBar onChange={onSearchChange} placeholder="Table Name" />
      <SearchBar onChange={onFilterChange} placeholder="Filter" />
      <DataTable
        style={globalStyles.container}
        listViewStyle={globalStyles.container}
        dataSource={dataSource}
        renderRow={renderRow}
        renderHeader={renderHeader}
      />
    </View>
  );
};

export default RealmExplorer;

RealmExplorer.propTypes = {
  database: PropTypes.instanceOf(UIDatabase).isRequired,
};
