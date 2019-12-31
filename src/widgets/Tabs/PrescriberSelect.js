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
import { SimpleTable } from '../SimpleTable';

import { UIDatabase } from '../../database';
import { getColumns } from '../../pages/dataTableUtilities';
import { selectPrescriber } from '../../reducers/PrescriptionReducer';
import { PrescriberActions } from '../../actions/PrescriberActions';

/**
 * Layout component used for a tab within the prescription wizard.
 *
 * @prop {Func} choosePrescriber Callback for selecting a supplier.
 * @prop {Func} data             Current set of prescriber data.
 * @prop {Func} onFilterData     Callback for filtering prescribers.
 * @prop {Func} searchTerm       The current filtering search term.
 * @prop {Func} createPrescriber Callback for creating a prescriber.
 * @prop {Func} isComplete       Indicator for this prescription being complete.
 */
const PrescriberSelectComponent = ({
  choosePrescriber,
  data,
  onFilterData,
  searchTerm,
  createPrescriber,
  isComplete,
}) => {
  const columns = React.useMemo(() => getColumns('prescriberSelect'), []);
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
      <SimpleTable
        data={data}
        columns={columns}
        selectRow={choosePrescriber}
        isDisabled={isComplete}
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
  const choosePrescriber = prescriberID => dispatch(selectPrescriber(prescriberID));
  const onFilterData = searchTerm => dispatch(PrescriberActions.filterData(searchTerm));
  const createPrescriber = () => dispatch(PrescriberActions.createPrescriber());
  return { choosePrescriber, onFilterData, createPrescriber };
};

const mapStateToProps = state => {
  const { prescriber, wizard } = state;
  const { searchTerm } = prescriber;
  const { isComplete } = wizard;
  const data = UIDatabase.objects('Prescriber').filtered(
    'firstName CONTAINS[c] $0 OR lastName CONTAINS[c] $0',
    searchTerm
  );
  return { data, searchTerm, isComplete };
};

PrescriberSelectComponent.defaultProps = {
  searchTerm: '',
  isComplete: false,
};

PrescriberSelectComponent.propTypes = {
  choosePrescriber: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  onFilterData: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  createPrescriber: PropTypes.func.isRequired,
  isComplete: PropTypes.bool,
};

export const PrescriberSelect = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriberSelectComponent);
