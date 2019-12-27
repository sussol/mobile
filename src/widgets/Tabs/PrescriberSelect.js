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

/**
 * Layout component used for a tab within the prescription wizard.
 *
 * @props {Func} choosePrescriber   Callback for selecting a supplier.
 */
const PrescriberSelectComponent = ({ choosePrescriber }) => {
  const columns = getColumns('prescriberSelect');

  const tableRef = React.useRef(React.createRef());

  return (
    <>
      <PrescriptionInfo />
      <FlexRow>
        <SearchBar viewStyle={localStyles.searchBar} />
        <PageButton text="Add Prescriber" />
      </FlexRow>
      <SimpleTable
        data={UIDatabase.objects('Prescriber')}
        columns={columns}
        selectRow={choosePrescriber}
        ref={tableRef}
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

  return { choosePrescriber };
};

PrescriberSelectComponent.propTypes = { choosePrescriber: PropTypes.func.isRequired };

export const PrescriberSelect = connect(null, mapDispatchToProps)(PrescriberSelectComponent);
