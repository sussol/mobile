/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { formatExpiryDate, parseExpiryDate } from '../utilities';
import { PageButton } from './PageButton';
import globalStyles from '../globalStyles/index';

/* Component that allows masking of TextInput for date in format MM/YY[YY] */
export class VVNToggle extends React.Component {
  constructor(props) {
    super(props);
    this.previousText = '';
    this.state = { status: this.props.status };
  }

  toggleState = () => {
    this.props.onEndEditing(!this.state.status);
    this.setState({ status: !this.state.status });
  }

  getFormattedDate = date => {
    // Remember previous good date
    this.previousFormattedDate = formatExpiryDate(date) || this.previousFormattedDate;
    return this.previousFormattedDate || 'mm/yy';
  };

  render() {
    const allStyle =
      this.state.status === null || typeof this.state.status === 'undefined'
        ? {
            ...globalStyles.disabledButton,
            ...globalStyles.disabledButtonText,
          }
        : this.state.status === true ? {
          borderColor: 'rgb(33, 157, 27)',
        } : {
          borderColor: 'red',
        };

    const passStyle = this.state.status ? {
      backgroundColor: 'rgb(33, 157, 27)',
      color: '#FFF',
    } : {}

    const failStyle = this.state.status !== null && this.state.status === false ? {
      backgroundColor: 'red',
      color: '#FFF',
    } : {}


    console.log(this.state.status === null || typeof this.state.status === 'undefined');

    console.log(this.state.status, typeof this.state.status === 'undefined');
    const { style, ...extraProps } = this.props;
    return (
      <View
        style={{
          ...globalStyles.horizontalContainer,
          marginBottom: 2,
          marginTop: 2,
          justifyContent: 'center',
          flexDirection: 'row',
          flex: 1,
          alignItems: 'stretch',
        }}
      >
        <TouchableOpacity
          key={this.props.key}
          style={{
            ...globalStyles.button,
            ...allStyle,
            padding: 'auto',
            fontFamilty: globalStyles.APP_FONT_FAMILY,
            width: 'auto',
            justifyContent: 'center',
            height: 'auto',
            flexDirection: 'row',
            alignItems: 'stretch',
            flex: 1,
          }}
          onPress={this.toggleState}
        >
          <Text
            style={{
              ...globalStyles.disabledButtonText,
              ...allStyle,
              ...failStyle,
              borderTopLeftRadius: 3,
              fontFamilty: globalStyles.APP_FONT_FAMILY,
              borderBottomLeftRadius: 3,
              textAlign: 'center',
              textAlignVertical: 'center',
              flexGrow: 1,
            }}
          >
            FAIL
          </Text>

          <Text
            style={{
              ...globalStyles.disabledButtonText,
              ...allStyle,
              ...passStyle,
              borderTopRightRadius: 3,
              borderBottomRightRadius: 3,
              textAlign: 'center',
              textAlignVertical: 'center',
              flexGrow: 1,
            }}
          >
            PASS
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

VVNToggle.propTypes = {
  text: PropTypes.object,
  style: PropTypes.object,
  onEndEditing: PropTypes.func,
  isEditable: PropTypes.bool,
};

const localStyles = StyleSheet.create({
  middleAlignText: {
    textAlign: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    height: 'auto',
    borderWidth: 1,
  },
});
