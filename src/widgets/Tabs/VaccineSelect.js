/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import { TABS } from '../constants';

import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { VaccinePrescriptionInfo } from '../VaccinePrescriptionInfo';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';
import { SimpleTable } from '../SimpleTable';
import { SimpleLabel } from '../SimpleLabel';

// import { NameNoteActions } from '../../actions/Entities/NameNoteActions';
import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
// import { WizardActions } from '../../actions/WizardActions';
import {
  selectSelectedBatchRows,
  selectSelectedBatches,
  selectSelectedRows,
  selectSelectedVaccines,
  selectVaccines,
} from '../../selectors/Entities/vaccinePrescription';
import { getColumns } from '../../pages/dataTableUtilities';

import { buttonStrings, dispensingStrings } from '../../localization';
import globalStyles from '../../globalStyles';

/**
 * Layout component used for a tab within the vaccine prescription wizard.
 *
 * @prop {Func}   createPatient         Callback for creating a patient.
 * @prop {object} formConfig            Configuration of the search form
 * @prop {Bool}   isAscending           Indicator if the list of patient is sorted ascending.
 * @prop {Func}   onCancelPrescription  Cancels the prescription and returns to the vaccine page
 * @prop {Func}   onFilterData          Callback for filtering patients.
 * @prop {Func}   onSortData            Callback for sorting patients by column.
 * @prop {Func}   patients              Current set of patient data.
 * @prop {Func}   selectPatient         Callback for selecting a patient.
 * @prop {String} sortKey               Current key the list of patients is sorted by.
 *
 */
const VaccineSelectComponent = ({
  onCancelPrescription,
  onSelectBatch,
  onSelectVaccine,
  selectedBatches,
  selectedBatchRows,
  selectedRows,
  selectedVaccine,
  vaccines,
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

  return (
    <FlexView style={pageTopViewContainer}>
      <FlexRow style={{ marginBottom: 7 }} justifyContent="flex-end">
        <VaccinePrescriptionInfo />
      </FlexRow>

      <View style={localStyles.container}>
        <View style={localStyles.listContainer}>
          <SimpleLabel text={dispensingStrings.select_item} size="medium" numberOfLines={1} />
          <SimpleTable
            columns={vaccineColumns}
            data={vaccines}
            disabledRows={disabledVaccineRows}
            selectedRows={selectedRows}
            selectRow={onSelectVaccine}
            style={{ marginTop: 3, height: '90%' }}
          />
        </View>
        {selectedVaccine && (
          <View style={localStyles.listContainer}>
            <SimpleLabel
              text={dispensingStrings.available_batches}
              size="medium"
              numberOfLines={1}
            />
            <SimpleTable
              columns={batchColumns}
              data={selectedVaccine.batches}
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
          isDisabled={selectedBatches.length === 0}
        />
      </FlexRow>
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());
  const onSelectBatch = itemBatch => dispatch(VaccinePrescriptionActions.selectBatch(itemBatch));
  const onSelectVaccine = vaccine => dispatch(VaccinePrescriptionActions.selectVaccine(vaccine));

  return { onCancelPrescription, onSelectBatch, onSelectVaccine };
};

const mapStateToProps = state => {
  const selectedRows = selectSelectedRows(state);
  const selectedBatchRows = selectSelectedBatchRows(state);
  const selectedBatches = selectSelectedBatches(state);
  const selectedVaccines = selectSelectedVaccines(state);
  const vaccines = selectVaccines(state);
  const [selectedVaccine] = selectedVaccines;

  return { selectedBatches, selectedBatchRows, selectedRows, selectedVaccine, vaccines };
};

VaccineSelectComponent.defaultProps = {
  selectedBatchRows: {},
  selectedRows: {},
  selectedBatches: [],
  selectedVaccine: undefined,
};

VaccineSelectComponent.propTypes = {
  onCancelPrescription: PropTypes.func.isRequired,
  onSelectBatch: PropTypes.func.isRequired,
  onSelectVaccine: PropTypes.func.isRequired,
  selectedBatchRows: PropTypes.object,
  selectedRows: PropTypes.object,
  selectedBatches: PropTypes.array,
  selectedVaccine: PropTypes.object,
  vaccines: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
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
