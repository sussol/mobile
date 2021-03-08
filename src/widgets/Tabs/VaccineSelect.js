/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { batch, connect } from 'react-redux';

import { TABS } from '../constants';

import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { VaccinePrescriptionInfo } from '../VaccinePrescriptionInfo';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';
import { SimpleTable } from '../SimpleTable';
import { SimpleLabel } from '../SimpleLabel';
import { Checkbox } from '../JSONForm/widgets/Checkbox';

import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
import { goBack } from '../../navigation/actions';
import {
  selectSelectedBatchRows,
  selectSelectedBatches,
  selectHasRefused,
  selectSelectedRows,
  selectSelectedVaccines,
  selectVaccines,
  selectSelectedVaccinator,
} from '../../selectors/Entities/vaccinePrescription';
import { getColumns } from '../../pages/dataTableUtilities';
import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';

import { vaccineStrings, buttonStrings, dispensingStrings } from '../../localization';
import globalStyles from '../../globalStyles';
import { FormDropdown } from '../FormInputs/FormDropdown';
import { UIDatabase } from '../../database/index';

/**
 * Layout component used for a tab within the vaccine prescription wizard.
 *
 * @prop {Func}   onCancelPrescription  Callback for cancelling the prescription.
 * @prop {Func}   onConfirm             Callback for confirming / creating transaction.
 * @prop {Func}   onSelectBatch         Callback for selecting a batch.
 * @prop {Func}   onSelectVaccine       Callback for selecting a vaccine.
 * @prop {array}  selectedBatches       Returns the currently selected batches.
 * @prop {object} selectedBatchRows     Selected batch row objects.
 * @prop {object} selectedRows          Selected vaccine row objects.
 * @prop {object} selectedVaccine       Currently selected vaccine.
 * @prop {array}  vaccines              List of vaccine items.
 *
 */
const VaccineSelectComponent = ({
  onCancelPrescription,
  onConfirm,
  onRefuse,
  onSelectBatch,
  onSelectVaccine,
  hasRefused,
  selectedBatches,
  selectedBatchRows,
  selectedRows,
  selectedVaccine,
  vaccines,
  vaccinator,
  onSelectVaccinator,
}) => {
  const { pageTopViewContainer } = globalStyles;
  const vaccineColumns = React.useMemo(() => getColumns(TABS.ITEM), []);
  const batchColumns = React.useMemo(() => getColumns(TABS.BATCH), []);
  const disabledVaccineRows = React.useMemo(
    () =>
      vaccines
        .filter(vaccine => vaccine.totalQuantity === 0)
        .reduce((acc, vaccine) => ({ ...acc, [vaccine.id]: true }), {}),
    [vaccines]
  );
  const disabledBatchRows = React.useMemo(
    () =>
      selectedVaccine?.batches
        ?.filter(b => b.doses === 0)
        .reduce((acc, b) => ({ ...acc, [b.id]: true }), {}),
    [vaccines]
  );
  const runWithLoadingIndicator = useLoadingIndicator();
  const confirmPrescription = React.useCallback(() => runWithLoadingIndicator(onConfirm), [
    onConfirm,
  ]);

  return (
    <FlexView style={pageTopViewContainer}>
      <FlexRow style={{ marginBottom: 7 }} justifyContent="flex-end">
        <VaccinePrescriptionInfo />
        <FormDropdown
          options={UIDatabase.objects('MedicineAdministrator')}
          optionKey="displayString"
          label={vaccineStrings.vaccinator}
          onValueChange={onSelectVaccinator}
          value={vaccinator}
        />
        <Checkbox
          options={{
            enumOptions: [
              { label: 'Refuse', value: true },
              { label: 'Accept', value: false },
            ],
          }}
          onChange={onRefuse}
          disabled={false}
          readonly={false}
          value={hasRefused}
        />
      </FlexRow>

      <View style={localStyles.container}>
        <View style={localStyles.listContainer}>
          {!hasRefused && (
            <>
              <SimpleLabel text={dispensingStrings.select_item} size="medium" numberOfLines={1} />
              <SimpleTable
                columns={vaccineColumns}
                data={vaccines}
                disabledRows={disabledVaccineRows}
                selectedRows={selectedRows}
                selectRow={onSelectVaccine}
                style={{ marginTop: 3, height: '90%' }}
              />
            </>
          )}
        </View>
        {selectedVaccine && !hasRefused && (
          <View style={localStyles.listContainer}>
            <SimpleLabel
              text={dispensingStrings.available_batches}
              size="medium"
              numberOfLines={1}
            />
            <SimpleTable
              columns={batchColumns}
              data={selectedVaccine.batches.sorted('expiryDate')}
              disabledRows={disabledBatchRows}
              selectedRows={selectedBatchRows}
              selectRow={onSelectBatch}
              style={{ marginTop: 3, height: '90%' }}
            />
          </View>
        )}
      </View>

      <FlexRow justifyContent="flex-end" alignItems="flex-end">
        <PageButtonWithOnePress
          text={buttonStrings.cancel}
          onPress={onCancelPrescription}
          style={{ marginRight: 7 }}
        />
        <PageButton
          text={buttonStrings.confirm}
          style={{ marginLeft: 5 }}
          isDisabled={selectedBatches.length === 0 && !hasRefused}
          onPress={confirmPrescription}
        />
      </FlexRow>
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const onRefuse = value => dispatch(VaccinePrescriptionActions.refuse(value));
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());
  const onSelectBatch = itemBatch => dispatch(VaccinePrescriptionActions.selectBatch(itemBatch));
  const onSelectVaccine = vaccine => dispatch(VaccinePrescriptionActions.selectVaccine(vaccine));
  const onSelectVaccinator = vaccinator =>
    dispatch(VaccinePrescriptionActions.selectVaccinator(vaccinator));
  const onConfirm = () =>
    batch(() => {
      dispatch(VaccinePrescriptionActions.confirm());
      dispatch(goBack());
    });

  return {
    onCancelPrescription,
    onConfirm,
    onRefuse,
    onSelectBatch,
    onSelectVaccine,
    onSelectVaccinator,
  };
};

const mapStateToProps = state => {
  const hasRefused = selectHasRefused(state);
  const selectedRows = selectSelectedRows(state);
  const selectedBatchRows = selectSelectedBatchRows(state);
  const selectedBatches = selectSelectedBatches(state);
  const selectedVaccines = selectSelectedVaccines(state);
  const vaccines = selectVaccines(state);
  const [selectedVaccine] = selectedVaccines;

  const vaccinator = selectSelectedVaccinator(state);

  return {
    vaccinator,
    hasRefused,
    selectedBatches,
    selectedBatchRows,
    selectedRows,
    selectedVaccine,
    vaccines,
  };
};

VaccineSelectComponent.defaultProps = {
  selectedBatchRows: {},
  selectedRows: {},
  selectedBatches: [],
  selectedVaccine: undefined,
  vaccinator: null,
};

VaccineSelectComponent.propTypes = {
  onCancelPrescription: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onRefuse: PropTypes.func.isRequired,
  onSelectBatch: PropTypes.func.isRequired,
  onSelectVaccine: PropTypes.func.isRequired,
  hasRefused: PropTypes.bool.isRequired,
  selectedBatchRows: PropTypes.object,
  selectedRows: PropTypes.object,
  selectedBatches: PropTypes.array,
  selectedVaccine: PropTypes.object,
  vaccines: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  vaccinator: PropTypes.object,
  onSelectVaccinator: PropTypes.func.isRequired,
};

export const VaccineSelect = connect(mapStateToProps, mapDispatchToProps)(VaccineSelectComponent);
const localStyles = StyleSheet.create({
  container: {
    height: '75%',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: 20,
    maxWidth: '50%',
  },
});
