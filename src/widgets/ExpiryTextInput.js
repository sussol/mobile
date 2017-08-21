/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { TextInput, StyleSheet } from 'react-native';
import { formatExpiryDate, parseExpiryDate } from '../utilities';

/* Component that allows masking of TextInput for date in format MM/YY[YY] */
export class ExpiryTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.previousText = '';
    autobind(this);
    this.state = { text: this.getFormattedDate(this.props.text) };
  }

  // Remove all text on focus
  onFocus() {
    this.setState({ text: '' });
  }

  onChangeText(text) {
    let newTextValue = text;

    if (text.length === 1) {
      const monthValue = parseInt(text, 10);
      if (isNaN(monthValue)) return;
      // If first digit > 1, then consider first digit as the month number
      if (monthValue > 1) newTextValue = `0${text}/`;
    } else if (this.previousText.length === 3 && text.length === 2) {
      // In case backspace is pressed after '/' is inserted, we delete the last digit
      // of the month
      newTextValue = newTextValue.slice(0, 1);
    } else if (text.length === 2) {
      if (text.endsWith('/')) {
        // If backspace is pressed with only one month digit prepend 0
        newTextValue = `0${text}`;
      } else {
        // If two digits are entered append '/''
        const monthValue = parseInt(text, 10);
        if (isNaN(monthValue) || monthValue > 12) return;
        newTextValue = `${text}/`;
      }
    } else if (text.length > 3 && text.length < 8) {
      // Disallow chaning cursor position changing of month
      if (text.slice(2, 3) !== '/') return;
      // Make sure everything after '/' is a number
      const yearValue = parseInt(text.slice(3), 10);
      if (isNaN(yearValue)) return;
    } else if (text.length !== 0 && text.length !== 3) return; // Allow MM/ value and empty value

    this.previousText = newTextValue;
    this.setState({ text: newTextValue });
  }

  onEndEditing(event) {
    const expiryDate = parseExpiryDate(event.nativeEvent.text);
    if (expiryDate && this.props.onEndEditing) {
      this.props.onEndEditing(expiryDate);
    }
    this.setState({ text: this.getFormattedDate(expiryDate) });
  }

  getFormattedDate(date) {
    // Remember previous good date
    this.previousFormattedDate = formatExpiryDate(date) || this.previousFormattedDate;
    return this.previousFormattedDate || 'mm/yy';
  }

  render() {
    const { style, ...extraProps } = this.props;
    return (
      <TextInput
        {...extraProps}
        keyboardType="numeric"
        onEndEditing={this.onEndEditing}
        editable={this.props.isEditable}
        onChangeText={this.onChangeText}
        onFocus={this.onFocus}
        value={this.state.text}
        style={[style, localStyles.middleAlignText]}
      />
    );
  }
}

ExpiryTextInput.propTypes = {
  text: PropTypes.object,
  style: PropTypes.object,
  onEndEditing: PropTypes.func,
  isEditable: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  middleAlignText: {
    textAlign: 'center',
  },
});
