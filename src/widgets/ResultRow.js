/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { APP_FONT_FAMILY, SUSSOL_ORANGE, BACKGROUND_COLOR, GREY } from '../globalStyles';

const ResultRow = props => {
  const { data, renderLeftText, renderRightText, onPress, isSelected, showCheckIcon } = props;
  const selected = isSelected(data);

  return (
    <TouchableOpacity
      style={[localStyles.resultRow, selected && localStyles.selected]}
      onPress={() => onPress(data)}
    >
      {showCheckIcon && selected ? (
        <Icon name="md-checkbox" style={localStyles.checkIcon} />
      ) : (
        <Icon name="md-square-outline" style={[localStyles.checkIcon, { color: GREY }]} />
      )}
      <Text
        style={[
          localStyles.text,
          localStyles.itemText,
          selected && localStyles.selectedText,
          {
            flex: 5,
            justifyContent: 'flex-start',
            alignItems: 'stretch',
          },
        ]}
      >
        {renderLeftText ? renderLeftText(data.item) : data.item.toString()}
      </Text>
      {renderRightText && (
        <Text
          style={[
            localStyles.text,
            localStyles.itemText,
            selected && localStyles.selectedText,
            {
              justifyContent: 'flex-end',
              textAlign: 'right',
            },
          ]}
        >
          {renderRightText(data.item)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

ResultRow.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  renderLeftText: PropTypes.func,
  renderRightText: PropTypes.func,
  onPress: PropTypes.func,
  isSelected: PropTypes.func,
  showCheckIcon: PropTypes.bool,
};

ResultRow.defaultProps = {
  renderLeftText: null,
  renderRightText: null,
  onPress: null,
  isSelected: false,
  showCheckIcon: false,
};

const localStyles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
  },
  itemText: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: BACKGROUND_COLOR,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  selectedText: { color: 'white' },
  selected: {
    backgroundColor: SUSSOL_ORANGE,
    borderColor: 'white',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  checkIcon: {
    fontSize: 28,
    color: 'white',
    padding: 10,
    marginRight: 0,
  },
});

export { ResultRow };
