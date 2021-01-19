import React from 'react';
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps } from 'react-native';
import propTypes from 'prop-types';

import { FlexRow } from '../FlexRow';

export const TextInputWithAffix = React.forwardRef(
  ({ TextInputImpl, SuffixComponent, PrefixComponent, flexRowProps, ...textInputProps }, ref) => (
    <FlexRow {...flexRowProps}>
      {PrefixComponent}
      <TextInputImpl ref={ref} {...textInputProps} />
      {SuffixComponent}
    </FlexRow>
  )
);

TextInputWithAffix.displayName = 'TextInputWithAffix';

TextInputWithAffix.defaultProps = {
  TextInputImpl: RNTextInput,
  SuffixComponent: <></>,
  PrefixComponent: <></>,
  textInputProps: {},
  flexRowProps: { flex: 0, alignItems: 'center' },
};

TextInputWithAffix.propTypes = {
  TextInputImpl: propTypes.node,
  SuffixComponent: propTypes.element,
  PrefixComponent: propTypes.element,
  textInputProps: propTypes.shape(RNTextInputProps),
  flexRowProps: propTypes.shape({
    alignItems: propTypes.string,
    justifyContent: propTypes.string,
    flex: propTypes.number,
  }),
};
