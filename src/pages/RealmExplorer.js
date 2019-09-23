/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { FlatList, View, VirtualizedList, Text, StyleSheet } from 'react-native';
import { SearchBar } from 'react-native-ui-components';

import globalStyles from '../globalStyles';
import { UIDatabase } from '../database/index';

import { schema } from '../database/schema';

const getObjectTypes = ({ schema }) => schema.map(object => object.name);

const OBJECT_TYPES = getObjectTypes(schema);

// TODO: parse object fields from schema.
const OBJECT_FIELDS = {
  Address: {
    id: 'string',
    line1: 'string',
    line2: 'string',
    line3: 'string',
    line4: 'string',
    zipCode: 'string',
  },
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
  Item: {
    id: 'string',
    code: 'string',
    name: 'string',
    defaultPackSize: 'number',
    batches: 'list',
    department: 'object',
    description: 'string',
    category: 'object',
    defaultPrice: 'number',
    isVisible: 'boolean',
    crossReferenceItem: 'object',
    unit: 'object',
  },
  ItemBatch: {
    id: 'string',
    item: 'object',
    packSize: 'number',
    numberOfPacks: 'number',
    expiryDate: 'date',
    batch: 'string',
    costPrice: 'number',
    sellPrice: 'number',
    supplier: 'object',
    donor: 'object',
    transactionBatches: 'list',
  },
  ItemCategory: {
    id: 'string',
    name: 'string',
    parentCategory: 'object',
  },
  ItemDepartment: {
    id: 'string',
    name: 'string',
    parentDepartment: 'object',
  },
  ItemStoreJoin: {
    id: 'string',
    itemId: 'string',
    joinsThisStore: 'bool',
  },
  MasterList: {
    id: 'string',
    name: 'string',
    note: 'string',
    items: 'list',
    programSettings: 'string',
    isProgram: 'boolean',
  },
  MasterListItem: {
    id: 'string',
    masterList: 'object',
    item: 'object',
    imprestQuantity: 'number',
    price: 'number',
  },
  MasterListNameJoin: {
    id: 'string',
    masterList: 'object',
    name: 'object',
  },
  Name: {
    id: 'string',
    name: 'string',
    code: 'string',
    phoneNumber: 'string',
    billingAddress: 'object',
    emailAddress: 'string',
    type: 'string',
    isCustomer: 'boolean',
    isSupplier: 'boolean',
    isManufacturer: 'boolean',
    masterLists: 'list',
    transactions: 'list',
    isVisible: 'boolean',
    supplyingStoreId: 'string',
  },
  NameStoreJoin: {
    id: 'string',
    nameId: 'string',
    joinsThisStore: 'boolean',
  },
  Options: {
    id: 'string',
    title: 'string',
    type: 'string',
    isActive: 'boolean',
  },
  Period: {
    id: 'string',
    startDate: 'date',
    endDate: 'date',
    name: 'string',
    periodSchedule: 'object',
    requisitions: 'list',
  },
  PeriodSchedule: {
    id: 'string',
    name: 'string',
    periods: 'list',
  },
  RequisitionItem: {
    id: 'string',
    requisition: 'object',
    item: 'object',
    stockOnHand: 'number',
    dailyUsage: 'number',
    imprestQuantity: 'number',
    requiredQuantity: 'number',
    suppliedQuantity: 'number',
    comment: 'string',
    sortIndex: 'number',
    option: 'object',
  },
  Setting: {
    key: 'string', 
    value: 'string',
    user: 'object',
  },
  Stocktake: {
    id: 'string',
    name: 'string',
    createdDate: 'date',
    stocktakeDate: 'date',
    status: 'string',
    createdBy: 'object',
    finalisedBy: 'object',
    comment: 'string',
    serialNumber: 'string',
    items: 'list',
    additions: 'object',
    reductions: 'object',
    program: 'object',
  },
  StocktakeBatch: {
    id: 'string',
    stocktake: 'object',
    itemBatch: 'object',
    snapshotNumberOfPacks: 'number',
    packSize: 'number',
    expiryDate: 'date',
    batch: 'string',
    costPrice: 'number',
    sellPrice: 'number',
    countedNumberOfPacks: 'number',
    sortIndex: 'number',
    option: 'object',
  },
  StocktakeItem: {
    id: 'string',
    item: 'Item',
    stocktake: 'object',
    batches: 'list',
  },
  SyncOut: {
    id: 'string',
    changeTime: 'number',
    changeType: 'string',
    recordType: 'string',
    recordId: 'string',
  },
  TransactionBatch: {
    itemId: 'string',
    itemName: 'string',
    itemBatch: 'object',
    batch: 'string',
    expiryDate: 'date',
    packSize: 'number',
    numberOfPacks: 'number',
    numberOfPacksSent: 'number',
    transaction: 'object',
    note: 'string',
    costPrice: 'number',
    sellPrice: 'number',
    donor: 'object',
    sortIndex: 'number',
  },
  TransactionCategory: {
    id: 'string',
    name: 'string',
    code: 'string',
    type: 'string',
    parentCategory: 'object',
  },
  TransactionItem: {
    id: 'string',
    item: 'object',
    transaction: 'object',
    batches: 'list',
  },
  User: {
    id: 'string',
    username: 'string',
    lastLogin: 'date',
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    passwordHash: 'string',
    salt: 'string',
  },
};

const toCapitalCase = value => value.charAt(0).toUpperCase() + value.slice(1);

const parseString = value => String(value);
const parseNumber = value => String(value);
const parseObject = value => value.id;
const parseList = value => value.length;
const parseBoolean = value => toCapitalCase(String(value));
const parseDate = value => value.toString();

const parseCell = (value, type) => {
  if (value === null || value === undefined) return 'N/A';
  switch (type) {
    case 'string':
      return parseString(value);
    case 'number':
      return parseNumber(value);
    case 'object':
      return parseObject(value);
    case 'list':
      return parseList(value);
    case 'boolean':
      return parseBoolean(value);
    case 'date':
      return parseDate(value);
    default:
      return '';
  }
};

const getInitialState = database => {
  const objectString = 'Requisition';
  const objectData = database.objects(objectString);
  const searchString = '';
  const filterString = '';
  const filteredData = objectData;
  return { objectString, objectData, searchString, filterString, filteredData };
};

const getUpdatedState = (database, state) => {
  const { objectString, objectData, searchString, filterString, filteredData } = state;
  const newState = { searchString, filterString };
  const updateObject = searchString !== objectString && OBJECT_TYPES.indexOf(searchString) >= 0;
  newState.objectString = updateObject ? searchString : objectString;
  newState.objectData = updateObject ? database.objects(newState.objectString) : objectData;
  if (filterString === '') {
    newState.filteredData = newState.objectData;
  } else {
    try {
      newState.filteredData = newState.objectData.filtered(filterString);
    } catch (err) {
      newState.filteredData = updateObject ? newState.objectData : filteredData;
    }
  }

  return newState;
};

const ExplorerTable = ({
  headerData,
  data,
  onSearchChange,
  onFilterChange,
  headerRowKeyExtractor,
  rowKeyExtractor,
  renderHeaderRow,
  renderRow,
}) => (
  <View style={[globalStyles.container]}>
    <SearchBar onChange={onSearchChange} placeholder="Table name" />
    <SearchBar onChange={onFilterChange} placeholder="Filter string" />
    <FlatList data={headerData} keyExtractor={headerRowKeyExtractor} renderItem={renderHeaderRow} />
    <VirtualizedList
      data={data}
      getItem={(d, i) => d[i]}
      getItemCount={d => d.length}
      keyExtractor={rowKeyExtractor}
      renderItem={renderRow}
    />
  </View>
);

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
  const [state, setState] = useState(getInitialState(database));

  const onSearchChange = searchString => {
    setState({ ...state, searchString });
  };

  const onFilterChange = filterString => {
    setState({ ...state, filterString });
  };

  useEffect(() => setState(getUpdatedState(database, state)), [
    state.searchString,
    state.filterString,
  ]);

  const objectFields = OBJECT_FIELDS[state.objectString];

  const headerRowKeyExtractor = (_, index) => index.toString();
  const rowKeyExtractor = ({ id }) => id;

  const renderHeaderRow = ({ item: headerRow }) => {
    const cells = Object.keys(headerRow).map(columnKey => (
      <View style={styles.cell}>
        <Text style={styles.cellText}>{columnKey}</Text>
      </View>
    ));
    return <View style={styles.row}>{cells}</View>;
  };

  const renderRow = ({ item: row }) => {
    const cells = Object.entries(objectFields).map(([columnKey, columnType]) => {
      const cell = row[columnKey];
      const cellValue = parseCell(cell, columnType);
      return (
        <View style={styles.cell}>
          <Text style={styles.cellText}>{cellValue}</Text>
        </View>
      );
    });
    return <View style={styles.row}>{cells}</View>;
  };

  return (
    <ExplorerTable
      headerData={[objectFields]}
      data={state.filteredData}
      onSearchChange={onSearchChange}
      onFilterChange={onFilterChange}
      headerRowKeyExtractor={headerRowKeyExtractor}
      rowKeyExtractor={rowKeyExtractor}
      renderHeaderRow={renderHeaderRow}
      renderRow={renderRow}
    />
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
  },
  cellText: {
    textAlign: 'center',
  },
  row: {
    flex: 1,
    flexBasis: 0,
    flexDirection: 'row',
    flexGrow: 1,
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
});

RealmExplorer.propTypes = {
  database: PropTypes.instanceOf(UIDatabase).isRequired,
};

export default RealmExplorer;
