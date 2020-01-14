/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { SearchBar } from '../SearchBar';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { PrescriptionInfo } from '../PrescriptionInfo';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../DataTable';

import { debounce } from '../../utilities';
import { PrescriberActions } from '../../actions/PrescriberActions';
import { PrescriptionActions } from '../../actions/PrescriptionActions';
import { getItemLayout, getColumns } from '../../pages/dataTableUtilities';
import { selectSortedAndFilteredPrescribers } from '../../selectors/prescriber';

/**
 * Layout component used for a tab within the prescription wizard.
 *
 * @prop {Func}   choosePrescriber Callback for selecting a supplier.
 * @prop {Func}   prescribers      Current set of prescriber data.
 * @prop {Func}   onFilterData     Callback for filtering prescribers.
 * @prop {Func}   onSortData       Callback for sorting prescribers by column.
 * @prop {Func}   searchTerm       The current filtering search term.
 * @prop {Func}   createPrescriber Callback for creating a prescriber.
 * @prop {Func}   isComplete       Indicator for this prescription being complete.
 * @prop {String} sortKey          Current key the list of prescribers is sorted by.
 * @prop {Bool}   isAscending      Indicator if the list of prescriber is sorted ascending.
 */
const PrescriberSelectComponent = ({
  choosePrescriber,
  prescribers,
  onFilterData,
  onSortData,
  searchTerm,
  sortKey,
  isAscending,
  createPrescriber,
  isComplete,
}) => {
  const columns = React.useMemo(() => getColumns('prescriberSelect'), []);

  const renderRow = React.useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = item.id;
      return (
        <DataTableRow
          rowData={prescribers[index]}
          rowKey={rowKey}
          getCallback={() => (isComplete ? null : () => choosePrescriber(item))}
          columns={columns}
          rowIndex={index}
          onPress={isComplete ? null : choosePrescriber}
        />
      );
    },
    [prescribers]
  );

  const renderHeader = React.useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        isAscending={isAscending}
        sortKey={sortKey}
        onPress={onSortData}
      />
    ),
    [columns, sortKey, isAscending]
  );

  return (
    <>
      <PrescriptionInfo />
      <FlexRow>
        <SearchBar
          viewStyle={localStyles.searchBar}
          onChangeText={onFilterData}
          value={searchTerm}
        />
        <PageButton text="Add Prescriber" onPress={createPrescriber} />
      </FlexRow>
      <DataTable
        data={prescribers}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={item => item.id}
        getItemLayout={getItemLayout}
      />
    </>
  );
};

const localStyles = StyleSheet.create({
  searchBar: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexGrow: 1,
  },
});

const mapDispatchToProps = dispatch => {
  const choosePrescriber = debounce(
    prescriberID => dispatch(PrescriptionActions.assignPrescriber(prescriberID)),
    1000,
    true
  );
  const onFilterData = searchTerm => dispatch(PrescriberActions.filterData(searchTerm));
  const onSortData = sortKey => dispatch(PrescriberActions.sortData(sortKey));
  const createPrescriber = () => dispatch(PrescriberActions.createPrescriber());

  return { onSortData, choosePrescriber, onFilterData, createPrescriber };
};

const mapStateToProps = state => {
  const { prescriber, wizard } = state;
  const { searchTerm, sortKey, isAscending } = prescriber;
  const { isComplete } = wizard;

  const prescribers = selectSortedAndFilteredPrescribers(state);

  return { prescribers, searchTerm, isComplete, sortKey, isAscending };
};

PrescriberSelectComponent.defaultProps = {
  searchTerm: '',
  isComplete: false,
};

PrescriberSelectComponent.propTypes = {
  choosePrescriber: PropTypes.func.isRequired,
  prescribers: PropTypes.object.isRequired,
  onFilterData: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  createPrescriber: PropTypes.func.isRequired,
  isComplete: PropTypes.bool,
  onSortData: PropTypes.func.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
};

export const PrescriberSelect = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriberSelectComponent);
