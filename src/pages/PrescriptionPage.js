/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import PropTypes from 'prop-types';

import { View, Text } from 'react-native';
import { connect } from 'react-redux';

import {
  FavouriteStarIcon,
  TableShortcut,
  TableShortcuts,
  Wizard,
  SimpleTable,
  PageButton,
} from '../widgets';

import { UIDatabase } from '../database';
import { getColumns } from './dataTableUtilities';

import { selectItem, selectPrescriber, switchTab } from '../reducers/PrescriptionReducer';

const ALPHABET = [...'abcdefghijklmnopqrstuvwxyz'];

const mapDispatchToProps = dispatch => {
  const choosePrescriber = prescriberID => dispatch(selectPrescriber(prescriberID));
  const chooseItem = itemID => dispatch(selectItem(itemID));
  const changeTab = currentTab => dispatch(switchTab(currentTab + 1));
  return { changeTab, choosePrescriber, chooseItem };
};

const mapStateToProps = state => {
  const { dispensary } = state;

  return dispensary;
};

const getPrescriberIndex = char => {
  const foundIndex = UIDatabase.objects('Prescriber').findIndex(
    item => item.firstName[0].toLowerCase() === char
  );
  return foundIndex;
};

const PrescriberSelect = connect(
  null,
  mapDispatchToProps
)(({ choosePrescriber }) => {
  const { row, extraLargeFlex } = localStyles;
  const columns = getColumns('prescriberSelect');

  const tableRef = React.useRef(React.createRef());

  const alphabetCallback = React.useCallback(
    character => {
      const startIndex = getPrescriberIndex(character);

      if (startIndex > -1) tableRef.current.scrollToIndex({ index: startIndex });
    },
    [tableRef.current]
  );

  const AlphabetShortcuts = React.useCallback(
    () =>
      ALPHABET.map(character => (
        <TableShortcut key={character} onPress={() => alphabetCallback(character)}>
          {character.toUpperCase()}
        </TableShortcut>
      )),
    []
  );

  return (
    <View style={row}>
      <TableShortcuts>
        <TableShortcut extraLarge>
          <FavouriteStarIcon />
        </TableShortcut>
        <AlphabetShortcuts />
      </TableShortcuts>
      <View style={extraLargeFlex}>
        <SimpleTable
          data={UIDatabase.objects('Prescriber')}
          columns={columns}
          selectRow={choosePrescriber}
          ref={tableRef}
        />
      </View>
    </View>
  );
});

const getItemIndex = char =>
  UIDatabase.objects('Item').findIndex(item => item.name[0].toLowerCase() === char);

const ItemSelect = connect(
  mapStateToProps,
  mapDispatchToProps
)(({ prescription, chooseItem, changeTab }) => {
  const { row, mediumFlex, largeFlex } = localStyles;
  const columns = getColumns('itemSelect');

  const tableRef = React.useRef(React.createRef());

  const alphabetCallback = React.useCallback(
    character => {
      const startIndex = getItemIndex(character);
      if (startIndex > -1) tableRef.current.scrollToIndex({ index: startIndex });
    },
    [tableRef.current]
  );

  const AlphabetShortcuts = React.useCallback(
    () =>
      ALPHABET.map(character => (
        <TableShortcut key={character} onPress={alphabetCallback}>
          {character.toUpperCase()}
        </TableShortcut>
      )),
    []
  );

  return (
    <View style={{ ...row, marginTop: 50 }}>
      <TableShortcuts>
        <TableShortcut>
          <FavouriteStarIcon />
        </TableShortcut>
        <AlphabetShortcuts />
      </TableShortcuts>
      <View style={mediumFlex}>
        <SimpleTable
          data={UIDatabase.objects('Item')}
          columns={columns}
          selectRow={x => chooseItem(x)}
          ref={tableRef}
        />
      </View>
      <View style={largeFlex}>
        <View>
          {prescription.items.map(item => (
            <View>
              <Text>{item.itemName}</Text>
            </View>
          ))}
        </View>
      </View>
      <PageButton text="NEXT" onPress={() => changeTab(1)} />
    </View>
  );
});

const Summary = connect(mapStateToProps)(({ prescription }) => (
  <View style={{ flex: 1 }}>
    {prescription.items.map(item => (
      <View>
        <Text>{item.itemName}</Text>
      </View>
    ))}
  </View>
));

const tabs = [PrescriberSelect, ItemSelect, Summary];
const titles = ['Select the Prescriber', 'Select items', 'Summary'];

export const Prescription = ({ currentTab, changeTab }) => (
  <Wizard tabs={tabs} titles={titles} currentTabIndex={currentTab} onPress={changeTab} />
);

const localStyles = {
  row: { flex: 1, flexDirection: 'row' },
  extraLargeFlex: { flex: 19 },
  largeFlex: { flex: 10 },
  mediumFlex: { flex: 9 },
  smallFlex: { flex: 1 },
};

export const PrescriptionPage = connect(mapStateToProps, mapDispatchToProps)(Prescription);

Prescription.propTypes = {
  currentTab: PropTypes.number.isRequired,
  changeTab: PropTypes.func.isRequired,
};
