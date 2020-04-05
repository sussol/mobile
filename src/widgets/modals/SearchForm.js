/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { FormControl } from '../FormControl';

import { DispensaryActions } from '../../actions/DispensaryActions';

import { generalStrings } from '../../localization';

import { APP_FONT_FAMILY, DARK_GREY, ROW_BLUE, WHITE } from '../../globalStyles';

import {
  createPatientRecord,
  createPrescriberRecord,
  queryPatientApi,
  queryPrescriberApi,
} from '../../utilities/network/lookupApi';

import {
  selectDataSetInUse,
  selectLookupFormConfig,
  selectLookupListConfig,
} from '../../selectors/dispensary';

const SearchListItemColumnComponent = ({ value, type }) => {
  const valueText = type === 'date' ? value?.toDateString() ?? '' : value;
  return (
    <View style={localStyles.columnContainer}>
      <Text style={localStyles.text}>{valueText}</Text>
    </View>
  );
};

const SearchListItemComponent = ({ item, config, onSelect }) => {
  const columns = config.map(({ key, type }) => {
    const value = item[key];
    return <SearchListItemColumn key={key} value={value} type={type} />;
  });
  return (
    <TouchableOpacity onPress={onSelect} style={localStyles.rowContainer}>
      {columns}
    </TouchableOpacity>
  );
};

const SearchListItemColumn = React.memo(SearchListItemColumnComponent);
const SearchListItem = React.memo(SearchListItemComponent);

export const SearchFormComponent = ({
  isPatient,
  isPrescriber,
  formConfig,
  listConfig,
  selectPatient,
  selectPrescriber,
}) => {
  const [data, setData] = useState([]);

  const selectRecord = useMemo(() => {
    if (isPatient) return patient => selectPatient(patient);
    if (isPrescriber) return prescriber => selectPrescriber(prescriber);
    // Bugsnag here.
    return () => null;
  }, [isPatient, isPrescriber]);

  const renderItem = useMemo(
    () => ({ item }) => {
      const onSelect = () => selectRecord(item);
      return <SearchListItem item={item} config={listConfig} onSelect={onSelect} />;
    },
    [listConfig]
  );

  const lookupRecords = useMemo(
    () => params => {
      if (isPatient) queryPatientApi(params).then(patientData => setData(patientData));
      if (isPrescriber) queryPrescriberApi(params).then(prescriberData => setData(prescriberData));
      // Bugsnag here.
    },
    [isPatient, isPrescriber]
  );

  return (
    <View style={localStyles.container}>
      <View style={localStyles.formContainer}>
        <FormControl
          inputConfig={formConfig}
          onSave={lookupRecords}
          showCancelButton={false}
          saveButtonText={generalStrings.search}
        />
      </View>
      <View style={localStyles.verticalSeparator} />
      <View style={localStyles.listContainer}>
        <FlatList data={data} keyExtractor={record => record.id} renderItem={renderItem} />
      </View>
    </View>
  );
};

const mapStateToProps = state => {
  const [isPatient, isPrescriber] = selectDataSetInUse(state);
  const formConfig = selectLookupFormConfig(state);
  const listConfig = selectLookupListConfig(state);
  return { isPatient, isPrescriber, formConfig, listConfig };
};

const mapDispatchToProps = dispatch => ({
  // TODO: update to use PatientActions.updatePatient()
  selectPatient: patient => {
    createPatientRecord(patient);
    dispatch(DispensaryActions.closeLookupModal());
  },
  // TODO: update to use PrescriberActions.updatePrescriber()
  selectPrescriber: prescriber => {
    createPrescriberRecord(prescriber);
    dispatch(DispensaryActions.closeLookupModal());
  },
});

export const SearchForm = connect(mapStateToProps, mapDispatchToProps)(SearchFormComponent);

SearchFormComponent.propTypes = {
  isPatient: PropTypes.bool.isRequired,
  isPrescriber: PropTypes.bool.isRequired,
  formConfig: PropTypes.array.isRequired,
  listConfig: PropTypes.array.isRequired,
  selectPatient: PropTypes.func.isRequired,
  selectPrescriber: PropTypes.func.isRequired,
};

SearchListItemComponent.propTypes = {
  item: PropTypes.object.isRequired,
  config: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
};

SearchListItemColumnComponent.propTypes = {
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
    justifyContent: 'space-between',
    borderColor: WHITE,
    backgroundColor: ROW_BLUE,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  columnContainer: {
    flex: 1,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: WHITE,
  },
  text: {
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
    marginHorizontal: 10,
    marginVertical: 10,
  },
});
