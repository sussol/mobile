/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import currency from 'currency.js';

import { CircleButton } from './CircleButton';
import { DropdownRow } from './DropdownRow';
import { DetailRow } from './DetailRow';
import { StepperRow } from './StepperRow';
import { CloseIcon } from './icons';
import { Separator } from './Separator';
import { TouchableNoFeedback } from './DataTable';

import { UIDatabase } from '../database';
import { PrescriptionActions } from '../actions/PrescriptionActions';

/**
 * Renders a row in the PrescriptionCart consisting of a `StepperRow`, `DropdownRow`,
 * `DetailsRow` and a close button.
 *
 * Is passed all details needed as this is a simple layout and presentation component.
 *
 * @prop {Bool}   isDisabled        Indicator whether this line is disabled.
 * @prop {String} itemName          The underlying Item's name for this line.
 * @prop {String} itemCode          The underlying Item's code for this line.
 * @prop {String} id                The underlying TransactionItem id for this line.
 * @prop {String} note              This lines note/direction.
 * @prop {Object} sellPrice         Currency object of the unit sell price.
 * @prop {Object} item              Underlying Item object for this line.
 * @prop {Number} totalQuantity     Total quantity of this item in the prescription.
 * @prop {Number} availableQuantity Total available quantity for the underlying item.
 * @prop {Func}   onChangeQuantity  Callback for editing the quantity for this item.
 * @prop {Func}   onRemoveItem      Callback for removing an item from the cart.
 * @prop {Func}   onChangeText      Callback for typing directions in the TextInput.
 * @prop {Func}   onDirectionSelect Callback for selecting a direction from the dropdown.
 */
const PrescriptionCartRowComponent = ({
  isDisabled,
  itemName,
  itemCode,
  id,
  note,
  sellPrice,
  item,
  totalQuantity,
  availableQuantity,
  onChangeQuantity,
  onRemoveItem,
  onChangeText,
  onDirectionSelect,
}) => {
  const itemDetails = React.useMemo(
    () => [
      { label: 'Code', text: itemCode },
      { label: 'Unit price', text: sellPrice },
    ],
    [itemCode]
  );

  const defaultDirections = React.useMemo(() => item.getDirectionExpansions(UIDatabase), [id]);

  return (
    <>
      <TouchableNoFeedback style={localStyles.flexRow}>
        <View style={localStyles.largeFlexRow}>
          <StepperRow
            text={itemName}
            quantity={totalQuantity}
            onChangeValue={onChangeQuantity}
            isDisabled={isDisabled}
            upperLimit={availableQuantity}
          />
          <DetailRow details={itemDetails} />
          <View style={{ height: 10 }} />
          <DropdownRow
            isDisabled={isDisabled}
            currentOptionText={note}
            options={defaultDirections}
            onChangeText={onChangeText}
            onSelection={onDirectionSelect}
            dropdownTitle="Directions"
            placeholder="Usage direction"
          />
        </View>
        <View style={localStyles.flexOne} />
        <CircleButton
          size="small"
          IconComponent={CloseIcon}
          onPress={isDisabled ? null : onRemoveItem}
        />
      </TouchableNoFeedback>
      <Separator />
    </>
  );
};

PrescriptionCartRowComponent.defaultProps = {
  isDisabled: false,
};

PrescriptionCartRowComponent.propTypes = {
  onChangeQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onChangeText: PropTypes.func.isRequired,
  onDirectionSelect: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  itemName: PropTypes.string.isRequired,
  totalQuantity: PropTypes.number.isRequired,
  itemCode: PropTypes.string.isRequired,
  sellPrice: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  note: PropTypes.string.isRequired,
  item: PropTypes.string.isRequired,
  availableQuantity: PropTypes.number.isRequired,
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

const mapStateToProps = (_, ownProps) => {
  const { transactionItem } = ownProps;

  const {
    itemName,
    totalQuantity,
    itemCode,
    sellPrice,
    note,
    item,
    availableQuantity,
  } = transactionItem;

  return {
    itemName,
    totalQuantity,
    itemCode,
    availableQuantity,
    sellPrice: currency(sellPrice).format({ formatWithSymbol: true }),
    note,
    item,
  };
};

const mapStateToDispatch = (dispatch, ownProps) => {
  const { transactionItem } = ownProps;
  const { id } = transactionItem;

  const onChangeQuantity = quantity => dispatch(PrescriptionActions.editQuantity(id, quantity));
  const onRemoveItem = () => dispatch(PrescriptionActions.removeItem(id));
  const onChangeText = direction => dispatch(PrescriptionActions.updateDirection(id, direction));
  const onDirectionSelect = direction =>
    dispatch(PrescriptionActions.appendDirection(id, direction));

  return { onChangeQuantity, onRemoveItem, onChangeText, onDirectionSelect };
};

export const PrescriptionCartRow = React.memo(
  connect(mapStateToProps, mapStateToDispatch)(PrescriptionCartRowComponent)
);
