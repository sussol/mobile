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

import { parsePositiveInteger } from '../utilities';

import { SUSSOL_ORANGE, APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../globalStyles';

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
  React.useEffect(() => {
    setAmounts({
      dollarAmount: String(currencyAmount.dollars()),
      centAmount: String(currencyAmount.cents()),
    });
  }, [currencyAmount]);

  const [amounts, setAmounts] = React.useState({
    dollarAmount: String(currencyAmount.dollars()),
    centAmount: String(currencyAmount.cents()),
  });

  const { dollarAmount, centAmount } = amounts;

  const refsArray = React.useRef([React.useRef(), React.useRef()]);

  const onSubmit = nextIndex => () => refsArray.current[nextIndex]?.current?.focus();

  const update = ({ centAmount: cents, dollarAmount: dollars }) => {
    const fullValue = `${dollars}.${cents}`;
    onChangeText(currency(fullValue));
  };

  const onChange = key => newAmount => {
    setAmounts(state => {
      const newState = { ...state, [key]: String(parsePositiveInteger(newAmount)) };
      update(newState);
      return newState;
    });
  };

  return (
    <FlexRow flex={1} alignItems="center">
      <FlexView flex={7}>
        <SimpleLabel text={label} size={size} />
      </FlexView>

      <FlexRow flex={3}>
        <SimpleLabel label="$" size="large" />
        <TextInput
          ref={refsArray.current[0]}
          value={dollarAmount}
          underlineColorAndroid={underlineColorAndroid}
          style={textInputStyle}
          selectTextOnFocus
          onChangeText={onChange('dollarAmount')}
          editable={!isDisabled}
          onSubmitEditing={onSubmit(1)}
        />
        <SimpleLabel label="." size="large" />
        <TextInput
          ref={refsArray.current[1]}
          value={centAmount}
          underlineColorAndroid={underlineColorAndroid}
          style={textInputStyle}
          selectTextOnFocus
          onChangeText={onChange('centAmount')}
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
