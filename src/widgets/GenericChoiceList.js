/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COMPONENT_HEIGHT } from '../globalStyles';

/**
 * Generic choice list for use within a ModalContainer.
 *
 * On selecting a choice, returns the object which was selected, the index/row
 * within the data array and the field which was displayed to the user.
 * @prop  {array}   data            Array of objects from which a choice must be made from
 * @prop  {string}  keyToDisplay    The object property which should be displayed to the user
 * @prop  {func}    onPress         Function to call on selection returns {item, index, field}
 * @prop  {int}     highlightIndex  Index of the data array for which object should be 'highlighted'
 * @prop  {string}  highlightValue  Value of the field in the data array for which object should be
 *                                  'highlighted'
 * NOTE: If there are multiple, equal values used in highlightValue within the data array,
 * multiple values will be highlighted.
 */
export class GenericChoiceList extends React.PureComponent {
  keyExtractor = (item, index) => {
    const { keyToDisplay } = this.props;
    const content = keyToDisplay && item ? item[keyToDisplay] : item;
    return `${content}${index}`;
  };

  renderRow = ({ item, index }) => {
    const {
      onPress,
      keyToDisplay,
      highlightIndex,
      highlightValue,
      renderLeftComponent,
    } = this.props;
    const { row, text } = localStyles;

    let shouldHighlight = false;
    if (keyToDisplay && highlightValue) shouldHighlight = item[keyToDisplay] === highlightValue;
    else if (!highlightValue) shouldHighlight = index === highlightIndex;

    const rowStyle = shouldHighlight ? { ...row, backgroundColor: '#E95C30' } : row;
    const textStyle = shouldHighlight ? { ...text, color: '#FFF' } : text;

    return (
      <TouchableOpacity onPress={() => onPress({ item, index, keyToDisplay })}>
        <View style={rowStyle}>
          {renderLeftComponent ? renderLeftComponent(item) : null}
          <Text style={textStyle}>{keyToDisplay ? item[keyToDisplay] : item}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { data } = this.props;
    if (!data) return null;
    return (
      <FlatList
        data={data}
        renderItem={this.renderRow}
        style={localStyles.list}
        keyExtractor={this.keyExtractor}
      />
    );
  }
}

const localStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingLeft: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: COMPONENT_HEIGHT,
  },
  list: {
    marginTop: 10,
    minWidth: '70%',
  },
  text: {
    fontSize: 20,
    marginLeft: 20,
  },
});

GenericChoiceList.defaultProps = {
  highlightIndex: 0,
  highlightValue: null,
  renderLeftComponent: null,
};

GenericChoiceList.propTypes = {
  keyToDisplay: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  highlightIndex: PropTypes.number,
  highlightValue: PropTypes.string,
  renderLeftComponent: PropTypes.func,
};

export default GenericChoiceList;
