/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import PropTypes from 'prop-types';

import { View } from 'react-native';
import { connect } from 'react-redux';

import { ROUTES } from '../navigation/constants';

import { FavouriteStarIcon, TableShortcut, TableShortcuts, Wizard, SimpleTable } from '../widgets';
import { UIDatabase } from '../database';
import { getColumns, getPageDispatchers } from './dataTableUtilities';

import { selectPrescriber } from '../reducers/DispensaryReducer';

const mapStateToProps = state => {
  const { dispensary } = state;

  return dispensary;
};

const ALPHABET = [...'abcdefghijklmnopqrstuvwxyz'];

const localStyles = {
  row: { flex: 1, flexDirection: 'row' },
  extraLargeFlex: { flex: 29 },
  largeFlex: { flex: 10 },
  mediumFlex: { flex: 9 },
  smallFlex: { flex: 1 },
};

const PrescriberSelect = connect(mapStateToProps)(({ dispatch }) => {
  const { row, extraLargeFlex } = localStyles;
  const columns = getColumns('prescriberSelect');

  const tableRef = React.useRef(React.createRef());

  return (
    <View style={row}>
      <TableShortcuts>
        <TableShortcut>
          <FavouriteStarIcon />
        </TableShortcut>
        {ALPHABET.map(character => (
          <TableShortcut>{character.toUpperCase()}</TableShortcut>
        ))}
      </TableShortcuts>
      <View style={extraLargeFlex}>
        <SimpleTable
          data={UIDatabase.objects('Prescriber')}
          columns={columns}
          selectRow={rowKey => {
            dispatch(selectPrescriber(rowKey));
          }}
          extraData={[]}
          ref={tableRef}
        />
      </View>
    </View>
  );
});

const ItemSelect = () => {
  const { row, mediumFlex, largeFlex } = localStyles;
  const columns = getColumns('itemSelect');

  const tableRef = React.useRef(React.createRef());

  return (
    <View style={row}>
      <TableShortcuts>
        <TableShortcut>
          <FavouriteStarIcon />
        </TableShortcut>
        {ALPHABET.map(character => (
          <TableShortcut>{character.toUpperCase()}</TableShortcut>
        ))}
      </TableShortcuts>
      <View style={mediumFlex}>
        <SimpleTable
          data={UIDatabase.objects('Item')}
          columns={columns}
          selectRow={() => {}}
          extraData={[]}
          ref={tableRef}
        />
      </View>
      <View style={largeFlex} />
    </View>
  );
};

const Summary = () => <View style={{ flex: 1 }} />;

const tabs = [PrescriberSelect, ItemSelect, Summary];
const titles = ['Select the Prescriber', 'Select items', 'Summary'];

export const Prescription = ({ currentTab, dispatch }) => (
  <Wizard
    tabs={tabs}
    titles={titles}
    currentTabIndex={currentTab}
    onPress={x => {
      dispatch({ type: 'SPECIFIC', payload: { nextTab: x + 1 } });
    }}
  />
);

const mapDispatchToProps = (dispatch, ownProps) =>
  getPageDispatchers(dispatch, ownProps, 'Transaction', ROUTES.PRESCRIPTION);

export const PrescriptionPage = connect(mapStateToProps, mapDispatchToProps)(Prescription);

Prescription.propTypes = {
  currentTab: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};
