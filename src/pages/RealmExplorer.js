/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useState, useCallback } from 'react';
import { View, VirtualizedList, Text, StyleSheet, ToastAndroid } from 'react-native';
import PropTypes from 'prop-types';

import { UIDatabase } from '../database/index';
import { schema } from '../database/schema';
import { useDebounce } from '../hooks/useDebounce';

import { SearchBar } from '../widgets';

import globalStyles from '../globalStyles';

const DEBOUNCE_TIMEOUT = 750;

const TYPES = {
  BOOLEAN: 'boolean',
  DATE: 'date',
  NUMBER: 'number',
  STRING: 'string',
  ARRAY: 'array',
  OBJECT: 'object',
};

const REALM_TYPES = {
  BOOL: 'bool',
  DATE: 'date',
  DOUBLE: 'double',
  FLOAT: 'float',
  INT: 'int',
  LIST: 'list',
  LINKING_OBJECTS: 'linkingObjects',
  OBJECT: 'object',
  STRING: 'string',
};

const TYPE_MAPPINGS = {
  [TYPES.BOOLEAN]: [REALM_TYPES.BOOL],
  [TYPES.DATE]: [REALM_TYPES.DATE],
  [TYPES.NUMBER]: [REALM_TYPES.INT, REALM_TYPES.FLOAT, REALM_TYPES.DOUBLE],
  [TYPES.STRING]: [REALM_TYPES.STRING],
  [TYPES.ARRAY]: [REALM_TYPES.LIST, REALM_TYPES.LINKING_OBJECTS],
  [TYPES.OBJECT]: [REALM_TYPES.OBJECT],
};

const typeMapper = new Map();

Object.entries(TYPE_MAPPINGS).forEach(([type, realmTypes]) => {
  realmTypes.forEach(realmType => {
    typeMapper.set(realmType, type);
  });
});

const parseType = realmType => {
  const { type } = realmType;
  if (type) return parseType(type);
  return typeMapper.get(realmType) || TYPES.OBJECT;
};

const getRealmObjects = ({ schema: objectSchemas }) => objectSchemas.map(({ name }) => name);

const getRealmObjectsFields = ({ schema: objectSchemas }) =>
  objectSchemas
    .map(({ schema: objectSchema }) => {
      const { name, properties } = objectSchema;
      const fields = Object.entries(properties)
        .map(([field, type]) => ({
          [field]: parseType(type),
        }))
        .reduce((acc, field) => ({ ...acc, ...field }), {});
      return { [name]: fields };
    })
    .reduce((acc, object) => ({ ...acc, ...object }));

const REALM_OBJECTS = getRealmObjects(schema);
const REALM_OBJECTS_FIELDS = getRealmObjectsFields(schema);

const toCapitalCase = value => value.charAt(0).toUpperCase() + value.slice(1);

const parseString = value => String(value);
const parseNumber = value => String(value);
const parseObject = value => value.id;
const parseArray = value => value.length;
const parseBoolean = value => toCapitalCase(String(value));
const parseDate = value => value.toString();

const parseCell = (value, type) => {
  if (value === null || value === undefined) return 'N/A';
  switch (type) {
    case TYPES.STRING:
      return parseString(value);
    case TYPES.NUMBER:
      return parseNumber(value);
    case TYPES.OBJECT:
      return parseObject(value);
    case TYPES.ARRAY:
      return parseArray(value);
    case TYPES.BOOLEAN:
      return parseBoolean(value);
    case TYPES.DATE:
      return parseDate(value);
    default:
      return '';
  }
};

const getInitialState = () => {
  const searchString = '';
  const filterString = '';
  const searchData = {};
  const filteredData = [];
  return { searchString, searchData, filterString, filteredData };
};

const updateSearchData = (newSearchString, state) => {
  try {
    const { searchString } = state;
    const updateObjectString = newSearchString !== searchString;
    // Some single characters are returning true for 'REALM_OBJECTS.indexOf(newSearchString) >= 0;'
    // there are no database objects with names shorter than 3 chars; so just skip those
    if (!updateObjectString || newSearchString.length < 3) return { ...state };
    const updateObject = REALM_OBJECTS.indexOf(newSearchString) >= 0;
    const newSearchData = updateObject ? UIDatabase.objects(newSearchString) : {};
    const newFilteredData = updateObject ? newSearchData.slice() : [];
    return {
      ...state,
      searchString: newSearchString,
      searchData: newSearchData,
      filteredData: newFilteredData,
    };
  } catch (e) {
    ToastAndroid.show(`Error! ${e.message}`, ToastAndroid.LONG);
    return { ...state };
  }
};

const getSearchBarRenderer = onSearchChange => {
  const RealmSearchBar = ({ searchString }) => (
    <SearchBar value={searchString} onChangeText={onSearchChange} placeholder="Object string" />
  );
  RealmSearchBar.propTypes = propTypes.RealmSearchBar;
  return RealmSearchBar;
};

const updateFilteredData = (newFilterString, state) => {
  const { searchData } = state;
  try {
    const newFilteredData =
      newFilterString === '' ? searchData.slice() : searchData.filtered(newFilterString).slice();
    return { ...state, filterString: newFilterString, filteredData: newFilteredData };
  } catch (err) {
    return { ...state, filterString: newFilterString };
  }
};

const getFilterBarRenderer = onFilterChange => {
  const RealmFilterBar = ({ filterString }) => (
    <SearchBar value={filterString} onChangeText={onFilterChange} placeholder="Filter string" />
  );
  RealmFilterBar.propTypes = propTypes.RealmFilterBar;
  return RealmFilterBar;
};

const getHeaderRenderer = realmObjectFields => () => {
  if (!realmObjectFields) return null;
  const headerCells = Object.keys(realmObjectFields).map(columnKey => (
    <View key={columnKey} style={styles.cell}>
      <Text style={styles.cellText}>{columnKey}</Text>
    </View>
  ));
  return <View style={styles.row}>{headerCells}</View>;
};

const getRowRenderer = realmObjectFields => {
  const RealmTableRow = ({ item }) => {
    if (!realmObjectFields) return null;
    const cells = Object.entries(realmObjectFields).map(([columnKey, columnType]) => {
      const cell = item[columnKey];
      const cellValue = parseCell(cell, columnType);
      return (
        <View key={columnKey} style={styles.cell}>
          <Text style={styles.cellText}>{cellValue}</Text>
        </View>
      );
    });
    return <View style={styles.row}>{cells}</View>;
  };
  RealmTableRow.propTypes = propTypes.RealmTableRow;
  return RealmTableRow;
};

const getItem = (data, index) => data[index];
const getItemCount = data => data.length;
const keyExtractor = ({ id }) => id;

const getTableRenderer = realmObjectFields => {
  const RealmTable = ({ data }) => {
    if (!realmObjectFields) return null;
    const TableHeader = getHeaderRenderer(realmObjectFields);
    const TableRow = getRowRenderer(realmObjectFields);
    return (
      <VirtualizedList
        ListHeaderComponent={TableHeader}
        data={data}
        getItem={getItem}
        getItemCount={getItemCount}
        keyExtractor={keyExtractor}
        renderItem={TableRow}
      />
    );
  };
  RealmTable.propTypes = propTypes.RealmTable;
  return RealmTable;
};

/**
 * A page for displaying objects in the local database. Includes search and filtering functionality.
 *
 * @prop   {UIDatabase}     database      App wide database.
 * @state  {string}         searchString  Current search string. Used to update current object.
 * @state  {string}         filterString  Current filter string. Used to update filtered data.
 * @state  {Realm.Results}  objectData    Reference to current database object results. Used to roll
 *                                        back filter state when filter is reset.
 * @state  {Realm.Results}  filteredData  Reference to current database object results after filter
 *                                        has been applied. Displayed to the user.
 */
export const RealmExplorer = () => {
  const [state, setState] = useState(getInitialState());

  const onSearchChange = useCallback(
    useDebounce(
      newObjectString => setState(prevState => updateSearchData(newObjectString, prevState)),
      DEBOUNCE_TIMEOUT
    ),
    []
  );
  const onFilterChange = useCallback(
    useDebounce(
      newFilterString => setState(prevState => updateFilteredData(newFilterString, prevState)),
      DEBOUNCE_TIMEOUT
    ),
    []
  );

  const { searchString, filterString, filteredData } = state;

  const realmObjectFields = REALM_OBJECTS_FIELDS[searchString];

  const RealmSearchBar = useCallback(getSearchBarRenderer(onSearchChange), [onSearchChange]);
  const RealmFilterBar = useCallback(getFilterBarRenderer(onFilterChange), [onFilterChange]);
  const RealmTable = useCallback(getTableRenderer(realmObjectFields), [realmObjectFields]);

  return (
    <View style={[globalStyles.container]}>
      <RealmSearchBar searchString={searchString} />
      <RealmFilterBar filterString={filterString} />
      <RealmTable data={filteredData} />
    </View>
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

const propTypes = {
  RealmSearchBar: {
    searchString: PropTypes.string.isRequired,
  },
  RealmFilterBar: {
    filterString: PropTypes.string.isRequired,
  },
  RealmTable: {
    data: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired })).isRequired,
  },
  RealmTableRow: {
    item: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
  },
};
