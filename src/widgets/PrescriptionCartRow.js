/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { CircleButton } from './CircleButton';
import { DropdownRow } from './DropdownRow';
import { DetailRow } from './DetailRow';
import { StepperRow } from './StepperRow';
import { CloseIcon } from './icons';
import { Separator } from './Separator';

/**
 * Renders a row in the PrescriptionCart consisting of a `StepperRow`, `DropdownRow`,
 * `DetailsRow` and a close button.
 *
 * Is passed all details needed as this is a simple layout and presentation component.
 *
 * @prop {Object} item
 * @prop {Func}   onChangeQuantity
 * @prop {Func}   onRemoveItem
 * @prop {Array}  options
 * @prop {Func}   onOptionSelection
 */
export const PrescriptionCartRow = ({
  item,
  onChangeQuantity,
  onRemoveItem,
  options,
  onOptionSelection,
  currentOptionText,
}) => {
  const { itemName, totalQuantity, itemCode, price, id } = item;

  const removeItem = React.useCallback(() => onRemoveItem(id), [id]);
  const onChangeValue = React.useCallback(
    quantity => {
      onChangeQuantity(id, quantity);
    },
    [id]
  );

  const itemDetails = [
    { label: 'Code', text: itemCode },
    { label: 'Price', text: price },
  ];
  return (
    <View>
      <View style={localStyles.flexRow}>
        <View style={localStyles.largeFlexRow}>
          <StepperRow text={itemName} quantity={totalQuantity} onChangeValue={onChangeValue} />
          <DetailRow details={itemDetails} />
          <View style={{ height: 10 }} />
          <DropdownRow
            currentOptionText={currentOptionText}
            options={options}
            onSelection={onOptionSelection}
            dropdownTitle="Directions"
          />
        </View>
        <View style={localStyles.flexOne} />
        <CircleButton IconComponent={CloseIcon} onPress={removeItem} />
      </View>
      <Separator width={1} />
    </View>
  );
};

PrescriptionCartRow.defaultProps = {
  currentOptionText: '',
};

PrescriptionCartRow.propTypes = {
  item: PropTypes.object.isRequired,
  onChangeQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  onOptionSelection: PropTypes.func.isRequired,
  currentOptionText: PropTypes.string,
};

const localStyles = StyleSheet.create({
  flexRow: { flex: 1, flexDirection: 'row' },
  largeFlexRow: { flex: 10 },
  flexOne: { flex: 1 },
  centerFlex: { flex: 1, justifyContent: 'center' },
  closeContainerStyle: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
