/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useState, useCallback } from 'react';
import { View, VirtualizedList, Text, StyleSheet } from 'react-native';

import { UIDatabase } from '../database/index';
import { schema } from '../database/schema';

import { SearchBar } from '../widgets';

import globalStyles from '../globalStyles';

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
  OBJECT: 'object',
  STRING: 'string',
};

const TYPE_MAPPINGS = {
  [TYPES.BOOLEAN]: [REALM_TYPES.BOOL],
  [TYPES.DATE]: [REALM_TYPES.DATE],
  [TYPES.NUMBER]: [REALM_TYPES.INT, REALM_TYPES.FLOAT, REALM_TYPES.DOUBLE],
  [TYPES.STRING]: [REALM_TYPES.STRING],
  [TYPES.ARRAY]: [REALM_TYPES.LIST],
  [TYPES.OBJECT]: [REALM_TYPES.OBJECT],
};

const typeMapper = new Map(
  Object.entries(TYPE_MAPPINGS)
    .map(([type, realmTypes]) => realmTypes.map(realmType => [realmType, type]))
    .flat()
);

const parseType = realmType => {
  const { type } = realmType;
  if (type) return parseType(type);
  return typeMapper.get(realmType) || TYPES.OBJECT;
};

const getRealmObjects = ({ schema: objectSchemas }) =>
  objectSchemas.map(({ schema: objectSchema }) => objectSchema.name);

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

const getInitialState = database => {
  const [realmObjectString] = REALM_OBJECTS;
  const realmObjectData = database.objects(realmObjectString);
  const searchString = realmObjectString;
  const filterString = '';
  const filteredData = realmObjectData;
  return { realmObjectString, realmObjectData, searchString, filterString, filteredData };
};

const searchData = (newSearchString, state) => {
  const { realmObjectString, realmObjectData } = state;
  const updateObject =
    newSearchString !== realmObjectString && REALM_OBJECTS.indexOf(newSearchString) >= 0;
  const newRealmObjectString = updateObject ? newSearchString : realmObjectString;
  const newRealmObjectData = updateObject
    ? UIDatabase.objects(newRealmObjectString)
    : realmObjectData;
  return {
    ...state,
    realmObjectString: newRealmObjectString,
    realmObjectData: newRealmObjectData,
    searchString: newSearchString,
    filteredData: newRealmObjectData,
  };
};

const filterData = (newFilterString, state) => {
  const { realmObjectData } = state;
  try {
    const newFilteredData =
      newFilterString === '' ? realmObjectData : realmObjectData.filtered(newFilterString);
    return { ...state, filterString: newFilterString, filteredData: newFilteredData };
  } catch (err) {
    return { ...state, filterString: newFilterString };
  }
};

const getHeaderRenderer = realmObjectFields => () => {
  const headerCells = Object.keys(realmObjectFields).map(columnKey => (
    <View key={columnKey} style={styles.cell}>
      <Text style={styles.cellText}>{columnKey}</Text>
    </View>
  ));
  return <View style={styles.row}>{headerCells}</View>;
};

const getRowRenderer = realmObjectFields => row => {
  const { item } = row;
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

/**
 * A page for displaying objects in the local database. Includes search and filtering functionality.
 *
 * @prop   {UIDatabase}     database           App wide database.
 * @state  {string}         realmObjectString  Current database object.
 * @state  {string}         searchString       Current search string. Used to update current object.
 * @state  {string}         filterString       Current filter string. Used to update filtered data.
 * @state  {Realm.Results}  realmObjectData    Reference to current database object results. Used to
 *                                             roll back filter state when filter is reset.
 * @state  {Realm.Results}  filteredData       Reference to current database object results after
 *                                             filter has been applied. Displayed to the user.
 */
export const RealmExplorer = () => {
  const [state, setState] = useState(getInitialState(UIDatabase));

  const { realmObjectString, searchString, filterString, filteredData } = state;

  const realmObjectFields = REALM_OBJECTS_FIELDS[realmObjectString];

  const renderHeader = useCallback(getHeaderRenderer(realmObjectFields), [realmObjectFields]);
  const renderRow = useCallback(getRowRenderer(realmObjectFields), [realmObjectFields]);
  const onSearchChange = useCallback(
    newSearchString => setState(prevState => searchData(newSearchString, prevState)),
    []
  );
  const onFilterChange = useCallback(
    newFilterString => setState(prevState => filterData(newFilterString, prevState)),
    []
  );

  return (
    <View style={[globalStyles.container]}>
      <SearchBar value={searchString} onChangeText={onSearchChange} placeholder="Object string" />
      <SearchBar value={filterString} onChangeText={onFilterChange} placeholder="Filter string" />
      <VirtualizedList
        ListHeaderComponent={renderHeader}
        data={filteredData}
        getItem={(d, i) => d[i]}
        getItemCount={d => d.length}
        keyExtractor={({ id }) => id}
        renderItem={renderRow}
      />
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

export default RealmExplorer;
