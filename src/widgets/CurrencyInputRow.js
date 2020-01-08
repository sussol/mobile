/* eslint-disable no-unused-expressions */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, StyleSheet } from 'react-native';

import currency from 'currency.js';

import { SimpleLabel } from './SimpleLabel';
import { FlexRow } from './FlexRow';
import { FlexView } from './FlexView';
import { SUSSOL_ORANGE, APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../globalStyles/index';

/**
 * Renders a label and two text inputs, with a preceding $ and a decimal
 * separator. Uses two text inputs for handling dollars and cents.
 *
 * @prop {String} size            The font size - see SimpleLabel for details.
 * @prop {String} label           Left hand side text value.
 * @prop {Func} onChangeText      Change text handler.
 * @prop {Bool} isDisabled        Indicator whether this component is disabled.
 * @prop {String} underlineColor  Underline color of text inputs.
 * @prop {Object} textInputStyle  Style for the text input components.
 * @prop {Object} currencyAmount  currency object for the value of the inputs.
 */
export const CurrencyInputRow = ({
  size,
  label,
  onChangeText,
  isDisabled,
  underlineColorAndroid,
  textInputStyle,
  currencyAmount,
}) => {
  const dollarAmount = React.useRef(String(currencyAmount.dollars()));
  const centAmount = React.useRef(String(currencyAmount.cents()));
  const refsArray = React.useRef([React.useRef(), React.useRef()]);

  const onSubmit = nextIndex => () => refsArray.current[nextIndex]?.current?.focus();

  const update = () => {
    const fullValue = `${dollarAmount.current}.${centAmount.current}`;
    onChangeText(currency(fullValue));
  };

  const onChange = key => x => {
    if (key === 'dollars') dollarAmount.current = x;
    if (key === 'cents') centAmount.current = x;
    update();
  };

  return (
    <FlexRow flex={1} alignItems="center">
      <FlexView flex={7}>
        <SimpleLabel text={label} size={size} />
      </FlexView>

      <FlexRow flex={3}>
        <SimpleLabel text="$" size="large" />
        <TextInput
          ref={refsArray.current[0]}
          value={dollarAmount.current}
          underlineColorAndroid={underlineColorAndroid}
          style={textInputStyle}
          selectTextOnFocus
          onChangeText={onChange('dollars')}
          editable={!isDisabled}
          onSubmitEditing={onSubmit(1)}
        />
        <SimpleLabel text="." size="large" />
        <TextInput
          ref={refsArray.current[1]}
          value={centAmount.current}
          underlineColorAndroid={underlineColorAndroid}
          style={textInputStyle}
          selectTextOnFocus
          onChangeText={onChange('cents')}
          editable={!isDisabled}
          onSubmitEditing={onSubmit(0)}
        />
      </FlexRow>
    </FlexRow>
  );
};

const localStyles = StyleSheet.create({
  textInputStyle: {
    flex: 3,
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
  },
});

CurrencyInputRow.defaultProps = {
  isDisabled: false,
  label: 'Payment Amount',
  underlineColorAndroid: SUSSOL_ORANGE,
  size: 'large',
  textInputStyle: localStyles.textInputStyle,
};

CurrencyInputRow.propTypes = {
  onChangeText: PropTypes.func.isRequired,
  currencyAmount: PropTypes.object.isRequired,
  size: PropTypes.string,
  label: PropTypes.string,
  isDisabled: PropTypes.bool,
  underlineColorAndroid: PropTypes.string,
  textInputStyle: PropTypes.object,
};
