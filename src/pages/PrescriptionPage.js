/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import PropTypes from 'prop-types';

import { View } from 'react-native';
import { connect } from 'react-redux';

import { Wizard, SimpleTable, PageButton } from '../widgets';
import { PrescriptionCart } from '../widgets/PrescriptionCart';
import { PrescriptionSummary } from '../widgets/PrescriptionSummary';

import { UIDatabase } from '../database';
import { getColumns } from './dataTableUtilities';
import {
  selectItem,
  selectPrescriber,
  switchTab,
  editQuantity,
} from '../reducers/PrescriptionReducer';

import { PrescriptionInfo } from '../widgets/PrescriptionInfo';
import { PrescriberSelect } from '../widgets/Tabs/PrescriberSelect';

/**
 * File contains Four components for the PrescriptionPage. The container component Prescription and
 * three "Tab" components PrescriberSelect/ItemSelect/Summary.
 */

const mapDispatchToProps = dispatch => {
  const choosePrescriber = prescriberID => dispatch(selectPrescriber(prescriberID));
  const chooseItem = itemID => dispatch(selectItem(itemID));
  const nextTab = currentTab => dispatch(switchTab(currentTab + 1));
  const updateQuantity = (id, quantity) => dispatch(editQuantity(id, quantity));
  return { nextTab, choosePrescriber, chooseItem, updateQuantity };
};

const mapStateToProps = state => {
  const { prescription, patient, prescriber } = state;
  return { ...prescription, ...patient, ...prescriber };
};

const ItemSelect = connect(
  mapStateToProps,
  mapDispatchToProps
)(({ transaction, chooseItem, nextTab, updateQuantity }) => {
  const { row, mediumFlex } = localStyles;
  const columns = getColumns('itemSelect');

  const tableRef = React.useRef(React.createRef());

  return (
    <>
      <PrescriptionInfo />
      <View style={{ ...row }}>
        <View style={mediumFlex}>
          <SimpleTable
            data={UIDatabase.objects('Item')}
            columns={columns}
            selectRow={x => chooseItem(x)}
            ref={tableRef}
          />
        </View>
        <View style={{ flex: 15, marginHorizontal: 15 }}>
          <PrescriptionCart items={transaction.items.slice()} onChangeQuantity={updateQuantity} />
          <PageButton text="Next" onPress={() => nextTab(1)} style={{ alignSelf: 'flex-end' }} />
        </View>
      </View>
    </>
  );
});

const Summary = connect(mapStateToProps)(({ transaction }) => (
  <View style={{ flex: 1 }}>
    <PrescriptionInfo />
    <PrescriptionSummary transaction={transaction} />
  </View>
));

const tabs = [PrescriberSelect, ItemSelect, Summary];
const titles = ['Select the Prescriber', 'Select items', 'Summary'];

export const Prescription = ({ currentTab, nextTab }) => (
  <Wizard tabs={tabs} titles={titles} currentTabIndex={currentTab} onPress={nextTab} />
);

const localStyles = {
  row: { flex: 1, flexDirection: 'row' },
  extraLargeFlex: { flex: 19 },
  largeFlex: { flex: 10 },
  mediumFlex: { flex: 9 },
  smallFlex: { flex: 1 },
  searchBar: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexGrow: 1,
  },
};

export const PrescriptionPage = connect(mapStateToProps, mapDispatchToProps)(Prescription);

Prescription.propTypes = {
  currentTab: PropTypes.number.isRequired,
  nextTab: PropTypes.func.isRequired,
};
