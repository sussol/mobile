/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';

import TouchableCell from './DataTable/TouchableCell';
import { ExpandIcon } from './icons';
import { dataTableStyles } from '../globalStyles/index';

const {
  dropDownCellTextContainer,
  dropDownCellIconContainer,
  dropDownFont,
  dropDownPlaceholderFont,
  touchableCellContainer,
} = dataTableStyles;

/**
 * Simple wrapper around TouchableCell which renders a small amount of text and
 * an icon indicating some action. Renders N/A in a lighter font when no
 * value is passed.
 *
 * @param {Bool}    isDisabled      Indicator whether this cell is disabled.
 * @param {Func}    onPress         Callback function for the onPress event.
 * @param {String}  rowKey          Key for this cells row.
 * @param {String}  columnKey       Key for this cells column.
 * @param {String}  value           Text value for this cell.
 * @param {Bool}    isLastCell      Indicator whether this cell is the last cell in a row.
 * @param {Number}  width           Flex width of this cell.
 * @param {String}  placeholder     Text to display when no value is selected.
 * @param {Bool}    debug           Indicator whether logging should occur for this cell.
 */
const DropDownCell = React.memo(
  ({ isDisabled, onPress, rowKey, columnKey, value, isLastCell, width, placeholder, debug }) => {
    const internalFontStyle = value ? dropDownFont : dropDownPlaceholderFont;

    const TouchableChild = () => (
      <View style={{ flexDirection: 'row' }}>
        <View style={dropDownCellIconContainer}>
          <ExpandIcon />
        </View>
        <View style={dropDownCellTextContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={internalFontStyle}>
            {value || placeholder}
          </Text>
        </View>
      </View>
    );

    return (
      <TouchableCell
        rowKey={rowKey}
        columnKey={columnKey}
        value={value}
        debug={debug}
        isLastCell={isLastCell}
        onPress={onPress}
        isDisabled={isDisabled}
        width={width}
        renderChildren={TouchableChild}
        containerStyle={touchableCellContainer}
      />
    );
  }
);

export default DropDownCell;
DropDownCell.defaultProps = {
  isDisabled: false,
  value: '',
  isLastCell: false,
  placeholder: 'N/A',
  debug: false,
};
DropDownCell.propTypes = {
  onPress: PropTypes.func.isRequired,
  rowKey: PropTypes.string.isRequired,
  columnKey: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  isDisabled: PropTypes.bool,
  value: PropTypes.string,
  isLastCell: PropTypes.bool,
  debug: PropTypes.bool,
  placeholder: PropTypes.string,
};
