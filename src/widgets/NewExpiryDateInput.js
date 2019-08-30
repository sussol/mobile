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
import { dataTableColors } from '../globalStyles/index';
import { getAdjustedStyle } from './DataTable/utilities';
import { parseExpiryDate, formatExpiryDate } from '../utilities';

/**
 * Renders a cell that on press or focus contains a TextInput for
 * editing values.
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
 * @param {Object}  touchableStyle Style object for the wrapping Touchable component
 * @param {Object}  viewStyle Style object for the wrapping View component
 * @param {Object}  textStyle Style object for the inner Text component
 * @param {Number}  width Optional flex property to inject into styles.
 * @param {Bool}  isLastCell Indicator for if this cell is the last
 *                                   in a row. Removing the borderRight if true.
 * @param {Object}  cellTextStyle Styles to pass as textStyle to Cell, when disabled.
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
    touchableStyle,
    viewStyle,
    textInputStyle,
    textStyle,
    textViewStyle,
    isLastCell,
    width,
    debug,
    placeholder,
    cellTextStyle,
  }) => {
    if (debug) console.log(`- ExpiryTextInputCell: ${value}`);

    const [expiryDate, finalseExpiryDate, setExpiryDate] = useExpiryDateMask(
      formatExpiryDate(value)
    );

    const usingPlaceholder = placeholder && !expiryDate;

    const focusCell = () => dispatch(focusAction(rowKey, columnKey));

    const finishEditingExpiryDate = () => {
      finalseExpiryDate();
      dispatch(editAction(parseExpiryDate(expiryDate)));
    };

    const onSubmit = () => {
      finishEditingExpiryDate();
      dispatch(focusNextAction(focusNextAction(rowKey, columnKey)));
    };

    // Render a plain Cell if disabled.
    if (isDisabled) {
      return (
        <Cell
          key={columnKey}
          viewStyle={viewStyle}
          textStyle={cellTextStyle}
          value={expiryDate}
          width={width}
          isLastCell={isLastCell}
        />
      );
    }

    const internalViewStyle = getAdjustedStyle(viewStyle, width, isLastCell);

    // Too many TextInputs causes React Native to crash, so only
    // truly mount the TextInput when the Cell is focused.
    // Use TouchableWithoutFeedback because we want the appearance and
    // feedback to resemble a TextInput regardless of focus.
    if (!isFocused) {
      const text = usingPlaceholder ? placeholder : expiryDate;
      const internalTextStyle = getAdjustedStyle(textStyle, width);
      const unfocusedTextStyle = usingPlaceholder ? { ...internalTextStyle } : internalTextStyle;
      return (
        <TouchableWithoutFeedback style={touchableStyle} onPress={focusCell}>
          <View style={internalViewStyle}>
            <View style={textViewStyle}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={unfocusedTextStyle}>
                {text}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }

    const internalTextStyle = getAdjustedStyle(textInputStyle, width);
    // first had a colour
    const focusedTextStyle = usingPlaceholder ? { ...internalTextStyle } : { ...internalTextStyle };

    // Render a Cell with a textInput.
    return (
      <View style={internalViewStyle}>
        <TextInput
          placeholder={placeholder}
          style={focusedTextStyle}
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
  touchableStyle: PropTypes.object,
  cellTextStyle: PropTypes.object,
  viewStyle: PropTypes.object,
  textStyle: PropTypes.object,
  width: PropTypes.number,
  textInputStyle: PropTypes.object,
  textViewStyle: PropTypes.object,
  isLastCell: PropTypes.bool,
  debug: PropTypes.bool,
  placeholder: PropTypes.string,
};

NewExpiryDateInput.defaultProps = {
  value: '',
  isDisabled: false,
  isFocused: false,
  isLastCell: false,
  touchableStyle: {},
  viewStyle: {},
  textStyle: {},
  cellTextStyle: {},
  textInputStyle: {},
  textViewStyle: {},

  width: 0,
  debug: false,
  placeholder: 'MM / YYYY',
};

export default NewExpiryDateInput;
