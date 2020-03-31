/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import PropTypes from 'prop-types';

import { FormControl } from '../FormControl';

import { getFormInputConfig } from '../../utilities/formInputConfigs';

import { APP_FONT_FAMILY, DARK_GREY } from '../../globalStyles';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { queryPatientApi, queryPrescriberApi } from '../../utilities/network/lookupApi';

const RECORD_TYPES = {
  PATIENT: 'patient',
  PRESCRIBER: 'prescriber',
};

const FORM_CONFIGS = {
  [RECORD_TYPES.PATIENT]: 'searchPatient',
  [RECORD_TYPES.PRESCRIBER]: 'searchPrescriber',
};

const LIST_CONFIGS = {
  [RECORD_TYPES.PATIENT]: ['firstName', 'lastName', 'dateOfBirth'],
  [RECORD_TYPES.PRESCRIBER]: ['firstName', 'lastName', 'registrationCode'],
};

const SearchListItemColumn = ({ value, type }) => (
  <View style={localStyles.columnContainer}>
    <Text style={localStyles.text}>{type === 'date' ? value.toDateString() : value}</Text>
  </View>
);

const SearchListItem = ({ listItem, listConfig }) => {
  const onPress = item => console.log(item);
  const columns = listConfig.map(({ key, type }) => {
    const value = listItem[key];
    return <SearchListItemColumn key={key} value={value} type={type} />;
  });
  return (
    <TouchableOpacity onPress={onPress} style={localStyles.rowContainer}>
      {columns}
    </TouchableOpacity>
  );
};

export const SearchForm = ({ dataSource }) => {
  const [data, setData] = useState([]);

  if (!RECORD_TYPES.includes(dataSource)) return null;

  const configKey = useMemo(() => FORM_CONFIGS[dataSource], [dataSource]);
  const formConfig = useMemo(() => getFormInputConfig(configKey), [configKey]);

  const listConfig = useMemo(() => {
    const keys = LIST_CONFIGS[dataSource];
    const keyTypes = keys.reduce(
      (acc, key) => ({ ...acc, [key]: formConfig.find(config => config.key === key)?.type }),
      {}
    );
    return keys.map(key => ({ key, type: keyTypes[key] }));
  }, [formConfig]);

  const renderItem = useMemo(
    () => ({ item }) => <SearchListItem key={item.id} listItem={item} listConfig={listConfig} />,
    [listConfig]
  );

  const lookupRecords = useMemo(
    () => params => {
      switch (dataSource) {
        case RECORD_TYPES.PATIENT: {
          queryPatientApi(params).then(patientData => setData(patientData));
          break;
        }
        case RECORD_TYPES.PRESCRIBER: {
          queryPrescriberApi(params).then(prescriberData => setData(prescriberData));
          break;
        }
        default:
          break;
      }
    },
    []
  );

  return (
    <View style={localStyles.container}>
      <View style={localStyles.formContainer}>
        <FormControl
          isDisabled={false}
          isSearchForm={true}
          onSave={lookupRecords}
          onCancel={() => null}
          inputConfig={formConfig}
        />
      </View>
      <View style={localStyles.verticalSeparator}></View>
      <View style={localStyles.listContainer}>
        <FlatList data={data} keyExtractor={record => record.id} renderItem={renderItem} />
      </View>
    </View>
  );
};

SearchForm.propTypes = {
  dataSource: PropTypes.string.isRequired,
};

SearchListItem.propTypes = {
  listItem: PropTypes.object.isRequired,
  listConfig: PropTypes.array.isRequired,
};

SearchListItemColumn.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  type: PropTypes.string.isRequired,
};

const localStyles = StyleSheet.create({
  container: {
    height: 720,
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'stretch',
  },
  verticalSeparator: {
    width: 10,
    backgroundColor: DARK_GREY,
  },
  listContainer: {
    flex: 3,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  columnContainer: {
    marginHorizontal: 10,
  },
  text: {
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
  },
});
