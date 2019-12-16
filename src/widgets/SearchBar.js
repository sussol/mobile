/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { MagnifyingGlass, Cancel } from './icons';
import { APP_FONT_FAMILY, SUSSOL_ORANGE } from '../globalStyles/index';
import { debounce } from '../utilities/index';

/**
 * Simple search bar - essentially a wrapper around a text input
 * with a magnifying glass icon and clear button.
 *
 * Debounces input by the user, such that the onChangeText callback
 * is only invoked once every `debounceTimeout`.
 *
 * NOTE: This component is exported MEMOIZED. See below for propsAreEqual
 * implementation.
 *
 * @param {String} color           Color of the entire component (monochrome only).
 * @param {String} onChangeText    Callback for changing text (debounced).
 * @param {String} value           Text value of the search input.
 * @param {String} placeholder     Placeholder value.
 * @param {String} autoFocus       Autofocus this component on mounting.
 * @param {String} textInputStyle  Style of the TextInput component.
 * @param {String} viewStyle       Style of the wrapping View component.
 * @param {String} debounceTimeout Time in milliseconds to debounce the onChangeText callback.
 * @param {Func}   onFocusOrBlur   Callback for onBlur and onFocus events.
 */
export const SearchBarComponent = ({
  color,
  onChangeText,
  value,
  placeholder,
  autoFocus,
  textInputStyle,
  viewStyle,
  debounceTimeout,
  onFocusOrBlur,
  ...textInputProps
}) => {
  const [textValue, setTextValue] = useState('');

  // Set the internal text value if it differs from the passed
  // value. Keeping the search bar text input up to date with
  // user input while debouncing actual filtering of data.
  useEffect(() => {
    if (value !== textValue) setTextValue(value);
  }, [value]);

  const internalViewStyle = { ...viewStyle, borderColor: color };
  const internalTextStyle = { ...textInputStyle, color };

  // To debounce a function, need to use the same function as the
  // last call. Memoize this to keep the reference semi-stable. Keeping
  // this reference is an optimization, not a requirement so can change.
  const debouncedCallback = useCallback(
    debounce(newValue => onChangeText(newValue), debounceTimeout),
    []
  );

  // On text change, set the internal text value, and call the debounced
  // callback. Keep the users input upto date, but optimize filtering.

  const onChangeTextCallback = useCallback(newValue => {
    setTextValue(newValue);
    debouncedCallback(newValue);
  }, []);

  return (
    <View style={internalViewStyle}>
      <MagnifyingGlass color={color} />
      <TextInput
        {...textInputProps}
        style={internalTextStyle}
        value={textValue}
        underlineColorAndroid="transparent"
        placeholderTextColor={color}
        placeholder={placeholder}
        onChangeText={onChangeTextCallback}
        autoFocus={autoFocus}
        onFocus={onFocusOrBlur}
        onBlur={onFocusOrBlur}
        selectTextOnFocus
      />
      {!!textValue && (
        <TouchableOpacity onPress={() => onChangeTextCallback('')}>
          <Cancel />
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Only re-render this component when the value or onFocusOrBlur
 * props change.
 */
const propsAreEqual = (
  { value: prevValue, onFocusOrBlur: prevOnFocusOrBlur },
  { value: nextValue, onFocusOrBlur: nextOnFocusOrBlur }
) => {
  const valuesAreEqual = prevValue === nextValue;
  const onFocusOrBlurAreEqual = prevOnFocusOrBlur === nextOnFocusOrBlur;
  return valuesAreEqual && onFocusOrBlurAreEqual;
};

export const SearchBar = React.memo(SearchBarComponent, propsAreEqual);

const defaultStyles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  textInput: {
    height: 40,
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flex: 1,
  },
});

SearchBarComponent.defaultProps = {
  debounceTimeout: 250,
  textInputStyle: defaultStyles.textInput,
  viewStyle: defaultStyles.container,
  color: SUSSOL_ORANGE,
  value: '',
  placeholder: '',
  autoFocus: false,
  onFocusOrBlur: null,
  WHITE: '#FFFFFF',
};

SearchBarComponent.propTypes = {
  color: PropTypes.string,
  debounceTimeout: PropTypes.number,
  onChangeText: PropTypes.func.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  textInputStyle: PropTypes.object,
  viewStyle: PropTypes.object,
  onFocusOrBlur: PropTypes.func,
  WHITE: PropTypes.string,
};
