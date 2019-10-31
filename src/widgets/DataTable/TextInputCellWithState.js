/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput } from 'react-native';

import Cell from './Cell';
import RefContext from './RefContext';

import { getAdjustedStyle } from './utilities';

const TextInputCellWithState = React.memo(
  ({
    value,
    rowKey,
    columnKey,
    isDisabled,
    placeholderColour,
    editAction,
    dispatch,
    isLastCell,
    width,
    debug,
    keyboardType,
    placeholder,
    viewStyle,
    rowIndex,
    textInputStyle,
    cellTextStyle,
    underlineColor,
  }) => {
    if (debug) console.log(`- TextInputCellWithState: ${value}`);

    const [internalValue, setInternalValue] = useState({ initialValue: value, newValue: value });

    const { initialValue, newValue } = internalValue;

    if (initialValue !== value) setInternalValue({ initialValue: value, newValue: value });

    const usingPlaceholder = placeholder && !internalValue;

    const { focusNextCell, getRefIndex, getCellRef } = React.useContext(RefContext);
    const refIndex = getRefIndex(rowIndex, columnKey);

    const focusNext = () => focusNextCell(refIndex);

    // On editing, set the internal state of this component.
    const onEdit = updatedValue => setInternalValue({ ...internalValue, newValue: updatedValue });

    // When editing has been completed, submit the final result.
    const onEnd = ({ nativeEvent }) => {
      const { text = '' } = nativeEvent || {};
      dispatch(editAction(text, rowKey, columnKey));
    };

    // Render a plain Cell if disabled.
    if (isDisabled) {
      return (
        <Cell
          key={columnKey}
          viewStyle={viewStyle}
          textStyle={cellTextStyle}
          value={value}
          width={width}
          isLastCell={isLastCell}
        />
      );
    }

    const internalViewStyle = getAdjustedStyle(viewStyle, width, isLastCell);
    const internalTextStyle = getAdjustedStyle(textInputStyle, width);

    // Render a Cell with a textInput.
    return (
      <View style={internalViewStyle}>
        <TextInput
          ref={getCellRef(refIndex)}
          placeholder={placeholder}
          style={internalTextStyle}
          value={usingPlaceholder ? '' : String(newValue)}
          placeholderTextColor={placeholderColour}
          onChangeText={onEdit}
          onSubmitEditing={focusNext}
          onEndEditing={onEnd}
          underlineColorAndroid={underlineColor}
          keyboardType={keyboardType}
          blurOnSubmit={false}
        />
      </View>
    );
  }
);

TextInputCellWithState.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDisabled: PropTypes.bool,
  placeholderColour: PropTypes.string,
  editAction: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  cellTextStyle: PropTypes.object,
  viewStyle: PropTypes.object,
  width: PropTypes.number,
  textInputStyle: PropTypes.object,
  isLastCell: PropTypes.bool,
  debug: PropTypes.bool,
  placeholder: PropTypes.string,
  rowIndex: PropTypes.number.isRequired,
  underlineColor: PropTypes.string,
  keyboardType: PropTypes.oneOf([
    'default',
    'number-pad',
    'decimal-pad',
    'numeric',
    'email-address',
    'phone-pad',
  ]),
};

TextInputCellWithState.defaultProps = {
  value: '',
  isDisabled: false,
  viewStyle: {},
  cellTextStyle: {},
  textInputStyle: {},
  isLastCell: false,
  width: 0,
  debug: false,
  keyboardType: 'numeric',
  placeholder: '',
  placeholderColour: '#CDCDCD',
  underlineColor: '#CDCDCD',
};

export default TextInputCellWithState;
