/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import currency from '../localization/currency';

import { CircleButton } from './CircleButton';
import { DropdownRow } from './DropdownRow';
import { DetailRow } from './DetailRow';
import { StepperRow } from './StepperRow';
import { CloseIcon } from './icons';
import { Separator } from './Separator';
import { TouchableNoFeedback } from './DataTable';

import { UIDatabase } from '../database';
import { PrescriptionActions } from '../actions/PrescriptionActions';
import { generalStrings, dispensingStrings } from '../localization';

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
 * @prop {Object} price             String representation of this items price.
 * @prop {Object} item              Underlying Item object for this line.
 * @prop {Number} totalQuantity     Total quantity of this item in the prescription.
 * @prop {Number} availableQuantity Total available quantity for the underlying item.
 * @prop {Func}   onChangeQuantity  Callback for editing the quantity for this item.
 * @prop {Func}   onRemoveItem      Callback for removing an item from the cart.
 * @prop {Func}   onChangeText      Callback for typing directions in the TextInput.
 * @prop {Func}   onDirectionSelect Callback for selecting a direction from the dropdown.
 * @prop {Func}   usingPayments     Indicator if the current store is using the payments module.
 */
const PrescriptionCartRowComponent = ({
  isDisabled,
  itemName,
  itemCode,
  id,
  note,
  price,
  item,
  totalQuantity,
  availableQuantity,
  onChangeQuantity,
  onRemoveItem,
  onChangeText,
  onDirectionSelect,
  usingPayments,
}) => {
  const itemDetails = React.useMemo(() => {
    const details = [{ label: generalStrings.code, text: itemCode }];
    if (usingPayments) details.push({ label: generalStrings.total_price, text: price });
    return details;
  }, [itemCode, price]);

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
            dropdownTitle={dispensingStrings.directions}
            placeholder={dispensingStrings.usage_directions}
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
  note: '',
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
  price: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  note: PropTypes.string,
  item: PropTypes.object.isRequired,
  availableQuantity: PropTypes.number.isRequired,
  usingPayments: PropTypes.bool.isRequired,
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

const mapStateToProps = (state, ownProps) => {
  const { transactionItem } = ownProps;
  const { modules } = state;

  const { usingPayments } = modules;
  const {
    itemName,
    totalQuantity,
    itemCode,
    totalPrice,
    note,
    item,
    availableQuantity,
    id,
  } = transactionItem;

  return {
    usingPayments,
    itemName,
    totalQuantity,
    itemCode,
    availableQuantity,
    price: currency(totalPrice).format(),
    note,
    item,
    id,
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

export const PrescriptionCartRow = connect(
  mapStateToProps,
  mapStateToDispatch
)(PrescriptionCartRowComponent);
