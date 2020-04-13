/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, TextInput } from 'react-native';
import moment from 'moment';

import Cell from './DataTable/Cell';

import { useExpiryDateMask } from '../hooks/useExpiryDateMask';

import { dataTableStyles } from '../globalStyles/index';

import { getAdjustedStyle } from './DataTable/utilities';
import RefContext from './DataTable/RefContext';

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
 * @param {bool} isDisabled If `true` will render a plain Cell element with no interaction
 * @param {Number}  width Optional flex property to inject into styles.
 * @param {Bool}  isLastCell Indicator if this cell is the last in a row.
 * @param {Func} onEndEditing Callback for onEndEditing event.
 * @param {String}  placeholder String to display when the cell is empty.
 * @param {String} underlineColor    Underline colour of TextInput on Android.
 */

const { expiryBatchView, expiryBatchText, expiryBatchPlaceholderText } = dataTableStyles;

export const ExpiryDateInput = React.memo(
  ({
    value,
    rowKey,
    columnKey,
    isDisabled,
    placeholderColour,
    onEndEditing,
    isLastCell,
    width,
    debug,
    placeholder,
    rowIndex,
    underlineColor,
  }) => {
    if (debug) console.log(`- ExpiryTextInputCell: ${value}`);

    const { focusNextCell, getRefIndex, getCellRef } = React.useContext(RefContext);

    const refIndex = getRefIndex(rowIndex, columnKey);

    const parseExpiryDate = React.useCallback(expiryDate => {
      const parsedExpiryDate = moment(expiryDate, 'DD/MM/YYYY');
      return parsedExpiryDate.isValid() ? parsedExpiryDate : null;
    }, []);

    const convertExpiryDate = React.useCallback(expiryDate => {
      const parsedExpiryDate = parseExpiryDate(expiryDate);
      return parsedExpiryDate?.toDate();
    }, []);

    const formatExpiryDate = React.useCallback(expiryDate => {
      const parsedExpiryDate = parseExpiryDate(expiryDate);
      return parsedExpiryDate?.format('DD/MM/YYYY') ?? '';
    }, []);

    // Customhook managing the editing of an expiry date to stay valid.
    const [expiryDate, setExpiryDate, finaliseExpiryDate] = useExpiryDateMask(
      formatExpiryDate(value)
    );

    // Helpers controlling the submitting of the expiry date. Losing focus/submitting
    // Handed similarly, but losing focus will not auto focus the next cell. Changes
    // to the underlying model are not committed until a valid date is entered.
    const finishEditingExpiryDate = () => {
      finaliseExpiryDate();
      onEndEditing(convertExpiryDate(expiryDate), rowKey, columnKey);
    };

    const onSubmit = () => {
      finishEditingExpiryDate();
      focusNextCell(refIndex);
    };

    const usingPlaceholder = placeholder && !expiryDate;

    const textStyle = usingPlaceholder ? expiryBatchPlaceholderText : expiryBatchText;

    // Render a plain Cell if disabled.
    if (isDisabled) {
      return (
        <Cell
          key={columnKey}
          viewStyle={expiryBatchView}
          textStyle={textStyle}
          value={usingPlaceholder ? 'N/A' : expiryDate}
          width={width}
          isLastCell={isLastCell}
        />
      );
    }

    const internalViewStyle = getAdjustedStyle(expiryBatchView, width, isLastCell);

    // Render a Cell with a textInput.
    return (
      <View style={internalViewStyle}>
        <TextInput
          ref={getCellRef(refIndex)}
          placeholder={placeholder}
          style={textStyle}
          value={expiryDate}
          placeholderTextColor={placeholderColour}
          onChangeText={setExpiryDate}
          onSubmitEditing={onSubmit}
          onEndEditing={finishEditingExpiryDate}
          underlineColorAndroid={underlineColor}
          keyboardType="numeric"
          blurOnSubmit={false}
        />
      </View>
    );
  }
);

ExpiryDateInput.propTypes = {
  value: PropTypes.instanceOf(Date),
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDisabled: PropTypes.bool,
  onEndEditing: PropTypes.func.isRequired,
  width: PropTypes.number,
  isLastCell: PropTypes.bool,
  debug: PropTypes.bool,
  placeholder: PropTypes.string,
  rowIndex: PropTypes.number.isRequired,
  placeholderColour: PropTypes.string,
  underlineColor: PropTypes.string,
};

ExpiryDateInput.defaultProps = {
  value: '',
  isDisabled: false,
  isLastCell: false,
  width: 0,
  debug: false,
  placeholder: 'dd/mm/yyyy',
  placeholderColour: '#CDCDCD',
  underlineColor: '#CDCDCD',
};

export default ExpiryDateInput;
