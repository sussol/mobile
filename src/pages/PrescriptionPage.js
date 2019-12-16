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
import { ALPHABET } from '../widgets/constants';
import { selectItem, selectPrescriber, switchTab } from '../reducers/PrescriptionReducer';

/**
 * File contains Four components for the PrescriptionPage. The container component Prescription and
 * three "Tab" components PrescriberSelect/ItemSelect/Summary.
 */

const mapDispatchToProps = dispatch => {
  const choosePrescriber = prescriberID => dispatch(selectPrescriber(prescriberID));
  const chooseItem = itemID => dispatch(selectItem(itemID));
  const nextTab = currentTab => dispatch(switchTab(currentTab + 1));
  return { nextTab, choosePrescriber, chooseItem };
};

const mapStateToProps = state => {
  const { prescription } = state;
  return prescription;
};

// Helper method finding the first instance of a Prescriber whos first name starts with
// the passed character.
const getPrescriberIndex = char =>
  UIDatabase.objects('Prescriber').findIndex(item => item.firstName[0].toLowerCase() === char);

// Helper method finding the first instance of an Item whos first name starts with
// the passed character.
const getItemIndex = char =>
  UIDatabase.objects('Item').findIndex(item => item.name[0].toLowerCase() === char);

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

const ItemSelect = connect(
  mapStateToProps,
  mapDispatchToProps
)(({ transaction, chooseItem, nextTab }) => {
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
          {transaction.items.map(item => (
            <View>
              <Text>{item.itemName}</Text>
            </View>
          ))}
        </View>
      </View>
      <PageButton text="NEXT" onPress={() => nextTab(1)} />
    </View>
  );
});

const Summary = connect(mapStateToProps)(({ transaction }) => (
  <View style={{ flex: 1 }}>
    {transaction.items.map(item => (
      <View>
        <Text>{item.itemName}</Text>
      </View>
    ))}
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
};

export const PrescriptionPage = connect(mapStateToProps, mapDispatchToProps)(Prescription);

Prescription.propTypes = {
  currentTab: PropTypes.number.isRequired,
  nextTab: PropTypes.func.isRequired,
};
