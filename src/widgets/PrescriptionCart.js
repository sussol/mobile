/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PrescriptionCartRow } from './PrescriptionCartRow';
import { FlexView } from './FlexView';

import globalStyles, { WHITE } from '../globalStyles';
import { dispensingStrings } from '../localization';
import { selectPrescriptionItems } from '../selectors/prescription';

/**
 * Layout container component for a prescriptions item cart.
 *
 * Pass a `Transaction.items` array and a callback which updates
 * a transactionItems quantity.
 *
 * @prop {Array} items             The current prescriptions items
 * @prop {Bool}  isDisabled        Indicator if this component should not be editable.
 */
const PrescriptionCartComponent = ({ items, isDisabled }) => {
  const renderPrescriptionCartRow = React.useCallback(
    ({ item }) => (
      <PrescriptionCartRow key={item.id} transactionItem={item} isDisabled={isDisabled} />
    ),
    [isDisabled]
  );

  const PrescriptionRows = React.useMemo(
    () => () => items.map(item => renderPrescriptionCartRow({ item })),
    [items]
  );

  return (
    <ScrollView style={localStyles.containerStyle}>
      {items.length ? (
        PrescriptionRows()
      ) : (
        <FlexView flex={1} justifyContent="center" alignItems="center">
          <Text style={{ ...globalStyles.textStyles, textAlign: 'center' }}>
            {dispensingStrings.click_on_an_item_to_add_it}
          </Text>
        </FlexView>
      )}
    </ScrollView>
  );
};

PrescriptionCartComponent.defaultProps = {
  isDisabled: false,
};

PrescriptionCartComponent.propTypes = {
  items: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  isDisabled: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  containerStyle: {
    elevation: 10,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 50,
    marginVertical: 30,
    backgroundColor: WHITE,
  },
});

const mapStateToProps = state => {
  const items = selectPrescriptionItems(state);
  return { items };
};

export const PrescriptionCart = connect(mapStateToProps)(PrescriptionCartComponent);
