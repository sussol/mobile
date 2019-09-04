/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { MagnifyingGlass, Cancel } from './icons';
import { SUSSOL_ORANGE } from '../globalStyles/index';
import { debounce } from '../utilities/index';

/**
 * Simple search bar - essentially a wrapper around a text input
 * with a magnifying glass icon and clear button.
 *
 * @param {String} color        Color of the entire component (monochrome only).
 * @param {String} onChangeText Callback for changing text (debounced).
 * @param {String} value        Text value of the search input.
 * @param {String} placeholder  Placeholder value.
 * @param {String} autoFocus
 * @param {String} textInputStyle
 * @param {String} viewStyle
 * @param {String} debounceTimeout
 */
export const SearchBar = ({
  color,
  onChangeText,
  value,
  placeholder,
  autoFocus,
  textInputStyle,
  viewStyle,
  debounceTimeout,
  ...textInputProps
}) => {
  const internalViewStyle = { ...viewStyle, borderColor: color };
  const internalTextStyle = { ...textInputStyle, color };

  const debouncedCallback = useMemo(
    () => newValue => debounce(onChangeText(newValue), debounceTimeout),
    [onChangeText]
  );

  return (
    <View style={internalViewStyle}>
      <MagnifyingGlass />
      <TextInput
        {...textInputProps}
        style={internalTextStyle}
        value={value}
        underlineColorAndroid="transparent"
        placeholderTextColor={color}
        placeholder={placeholder}
        onChangeText={debouncedCallback}
        autoFocus={autoFocus}
        selectTextOnFocus
      />
      {!!value && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Cancel color={color} size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  textInput: {
    height: 40,
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flex: 1,
  },
});

SearchBar.defaultProps = {
  debounceTimeout: 250,
  textInputStyle: defaultStyles.textInput,
  viewStyle: defaultStyles.container,
  color: SUSSOL_ORANGE,
  value: '',
  placeholder: '',
  autoFocus: false,
};

SearchBar.propTypes = {
  color: PropTypes.string,
  debounceTimeout: PropTypes.number,
  onChangeText: PropTypes.func.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  textInputStyle: PropTypes.object,
  viewStyle: PropTypes.object,
};
