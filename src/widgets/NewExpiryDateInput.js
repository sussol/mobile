/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableWithoutFeedback, Text, TextInput } from 'react-native';
import { useExpiryDateMask } from '../hooks/useExpiryDateMask';
import Cell from './DataTable/Cell';
import { dataTableColors, newDataTableStyles } from '../globalStyles/index';
import { getAdjustedStyle } from './DataTable/utilities';
import { parseExpiryDate, formatExpiryDate } from '../utilities';

/**
 * Renders an expiry date cell, managing its own state and not submitting
 * a date to be committed to the underlying model until a valid date has
 * been submitted.
 *
 * Similar to EditableCell, this component renders a Cell when disabled,
 * a Text wrapped in a TouchableComponent when un-focused and a TextInput
 * when focused - A workaround for react-native crashes when large numbers
 * of TextInput components are rendered.
 *
 * @param {string|number} value The value to render in cell
 * @param {string|number} rowKey Unique key associated to row cell is in
 * @param {string|number} columnKey Unique key associated to column cell is in
 * @param {bool} disabled If `true` will render a plain Cell element with no interaction
 * @param {bool} isFocused If `false` will TouchableOpacity that dispatches a focusAction
 *                         when pressed. When `true` will render a TextInput with focus
 * @param {func} editAction Action creator for handling editing of this cell.
 *                          `(newValue, rowKey, columnKey) => {...}`
 * @param {func} focusAction Action creator for handling focusing of this cell.
 *                          `(rowKey, columnKey) => {...}`
 * @param {func} focusNextAction Action creator for handling focusing of this cell.
 *                          `(rowKey, columnKey) => {...}`
 * @param {func}  dispatch Reducer dispatch callback for handling actions
 * @param {Number}  width Optional flex property to inject into styles.
 * @param {Bool}  isLastCell Indicator for if this cell is the last
 *                                   in a row. Removing the borderRight if true.
 * @param {String}  placeholder String to display when the cell is empty.
 * @
 *
 */
export const NewExpiryDateInput = React.memo(
  ({
    value,
    rowKey,
    columnKey,
    isDisabled,
    isFocused,
    editAction,
    focusAction,
    focusNextAction,
    dispatch,
    isLastCell,
    width,
    debug,
    placeholder,
  }) => {
    if (debug) console.log(`- ExpiryTextInputCell: ${value}`);

    // Customhook managing the editing of an expiry date to stay valid.
    const [expiryDate, finalseExpiryDate, setExpiryDate] = useExpiryDateMask(
      formatExpiryDate(value)
    );

    // Helpers controlling the submitting of the expiry date. Losing focus/submitting
    // Handed similarly, but losing focus will not auto focus the next cell. Changes
    // to the underlying model are not committed until a valid date is entered.
    const finishEditingExpiryDate = () => {
      finalseExpiryDate();
      dispatch(editAction(parseExpiryDate(expiryDate), rowKey, columnKey));
    };

    const onSubmit = () => {
      finishEditingExpiryDate();
      dispatch(focusNextAction(focusNextAction(rowKey, columnKey)));
    };

    const usingPlaceholder = placeholder && !expiryDate;
    const {
      expiryBatchTextView,
      expiryBatchViewStyle,
      expiryBatchText,
      expiryBatchPlaceholderText,
    } = newDataTableStyles;

    const textStyle = usingPlaceholder ? expiryBatchPlaceholderText : expiryBatchText;

    // Render a plain Cell if disabled.
    if (isDisabled) {
      return (
        <Cell
          key={columnKey}
          viewStyle={expiryBatchViewStyle}
          textStyle={textStyle}
          value={usingPlaceholder ? 'N/A' : expiryDate}
          width={width}
          isLastCell={isLastCell}
        />
      );
    }

    const internalViewStyle = getAdjustedStyle(expiryBatchViewStyle, width, isLastCell);

    // Too many TextInputs causes React Native to crash, so only
    // truly mount the TextInput when the Cell is focused.
    // Use TouchableWithoutFeedback because we want the appearance and
    // feedback to resemble a TextInput regardless of focus.
    if (!isFocused) {
      const text = usingPlaceholder ? placeholder : expiryDate;

      return (
        <TouchableWithoutFeedback onPress={dispatch(focusAction(rowKey, columnKey))}>
          <View style={internalViewStyle}>
            <View style={expiryBatchTextView}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={textStyle}>
                {text}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }

    // Render a Cell with a textInput.
    return (
      <View style={internalViewStyle}>
        <TextInput
          placeholder={placeholder}
          style={textStyle}
          value={expiryDate}
          onChangeText={setExpiryDate}
          autoFocus={isFocused}
          onSubmitEditing={onSubmit}
          onEndEditing={finishEditingExpiryDate}
          underlineColorAndroid={dataTableColors.editableCellUnderline}
          keyboardType="numeric"
          selectTextOnFocus
        />
      </View>
    );
  }
);

NewExpiryDateInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDisabled: PropTypes.bool,
  isFocused: PropTypes.bool,
  editAction: PropTypes.func.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusNextAction: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  width: PropTypes.number,
  isLastCell: PropTypes.bool,
  debug: PropTypes.bool,
  placeholder: PropTypes.string,
};

NewExpiryDateInput.defaultProps = {
  value: '',
  isDisabled: false,
  isFocused: false,
  isLastCell: false,
  width: 0,
  debug: false,
  placeholder: 'mm/yyyy',
};

export default NewExpiryDateInput;
