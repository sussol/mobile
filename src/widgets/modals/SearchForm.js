/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { connect, batch } from 'react-redux';
import PropTypes from 'prop-types';

import { FormControl } from '../FormControl';

import { ConfirmForm } from '../modalChildren/ConfirmForm';
import { ModalContainer } from '.';

import { InsuranceActions } from '../../actions/InsuranceActions';
import { PatientActions } from '../../actions/PatientActions';
import { PrescriberActions } from '../../actions/PrescriberActions';

import { generalStrings } from '../../localization';

import { APP_FONT_FAMILY, DARK_GREY, ROW_BLUE, WHITE } from '../../globalStyles';

import { queryPatientApi, queryPrescriberApi } from '../../sync/lookupApiUtils';

import {
  selectDataSetInUse,
  selectLookupFormConfig,
  selectLookupListConfig,
} from '../../selectors/dispensary';

const SearchListItemColumnComponent = ({ value, type }) => {
  const valueText = type === 'date' ? value?.toDateString() ?? generalStrings.not_available : value;
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
  const [error, setError] = useState();

  const isError = useMemo(() => !!error, [error]);
  const resetError = useCallback(() => setError(), []);

  const renderItem = useMemo(
    () => ({ item }) => {
      const onSelect = () => selectRecord(item);
      return <SearchListItem item={item} config={listConfig} onSelect={onSelect} />;
    },
    [listConfig]
  );

  const selectRecord = useMemo(() => {
    if (isPatient) return patient => selectPatient(patient);
    if (isPrescriber) return prescriber => selectPrescriber(prescriber);
    return () => null;
  }, [isPatient, isPrescriber]);

  const lookupPatient = useCallback(params => {
    queryPatientApi(params).then(({ error: patientError, data: patientData }) => {
      setError(patientError);
      setData(patientData);
    });
  }, []);

  const lookupPrescriber = useCallback(params => {
    queryPrescriberApi(params).then(({ error: prescriberError, data: prescriberData }) => {
      setError(prescriberError);
      setData(prescriberData);
    });
  }, []);

  const lookupRecords = useMemo(
    () => params => {
      if (isPatient) lookupPatient(params);
      if (isPrescriber) lookupPrescriber(params);
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
      <ModalContainer fullScreen={true} isVisible={isError}>
        <ConfirmForm
          isOpen={isError}
          questionText={error}
          onConfirm={resetError}
          confirmText="Close"
        />
      </ModalContainer>
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
  selectPatient: patient => {
    dispatch(PatientActions.patientUpdate(patient));
    batch(() => patient.policies.forEach(policy => dispatch(InsuranceActions.update(policy))));
  },
  selectPrescriber: prescriber => dispatch(PrescriberActions.updatePrescriber(prescriber)),
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
