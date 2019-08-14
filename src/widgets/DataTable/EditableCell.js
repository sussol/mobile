import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableWithoutFeedback, Text, TextInput, StyleSheet } from 'react-native';

import Cell from './Cell';

/**
 * Renders a cell that on press or focus contains a TextInput for
 * editing values.
 *
 * @param {string|number} value
 * @param {string|number} rowKey
 * @param {string|number} columnKey
 * @param {bool} disabled
 * @param {func} editAction
 * @param {func} dispatch
 */
const EditableCell = React.memo(
  ({
    value,
    rowKey,
    columnKey,
    disabled,
    isFocused,
    editAction,
    focusAction,
    focusNextAction,
    dispatch,
  }) => {
    const onEdit = newValue => dispatch(editAction(newValue, rowKey, columnKey));

    const focusCell = () => dispatch(focusAction(rowKey, columnKey));
    const focusNextCell = () => dispatch(focusNextAction(rowKey, columnKey));

    console.log(`- EditableCell: ${value}`);

    // Render a plain Cell if disabled.
    if (disabled) {
      return <Cell value={value} />;
    }

    // Too many TextInputs causes React Native to crash, so only
    // truly mount the TextInput when the Cell is focused.
    // Use TouchableWithoutFeedback because we want the appearance and
    // feedback to resemble a TextInput regardless of focus.
    if (!isFocused) {
      return (
        <TouchableWithoutFeedback onPress={focusCell}>
          <View style={defaultStyles.cell}>
            <Text>{value}</Text>
          </View>
        </TouchableWithoutFeedback>
      );
    }

    // Render a Cell with a textInput.
    return (
      <View style={defaultStyles.cell}>
        <TextInput
          style={defaultStyles.editableCell}
          value={value}
          onChangeText={onEdit}
          autoFocus={isFocused}
          onSubmitEditing={focusNextCell}
        />
      </View>
    );
  }
);

EditableCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  disabled: PropTypes.bool,
  isFocused: PropTypes.bool,
  editAction: PropTypes.func.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusNextAction: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

EditableCell.defaultProps = {
  value: '',
  disabled: false,
  isFocused: false,
};

const defaultStyles = StyleSheet.create({
  cell: {
    flex: 1,
    backgroundColor: 'pink',
    justifyContent: 'center',
  },
  editableCell: {
    flex: 1,
    backgroundColor: 'green',
    justifyContent: 'center',
  },
});

export default EditableCell;
