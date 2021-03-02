import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, StyleSheet } from 'react-native';
import { LIGHT_GREY, SUSSOL_ORANGE } from '../../../globalStyles/colors';
import { APP_FONT_FAMILY } from '../../../globalStyles/fonts';
import { useJSONFormOptions } from '../JSONFormContext';

export const Text = ({ autofocus, disabled, placeholder, value, onChange }) => {
  const { focusController } = useJSONFormOptions();

  const ref = focusController.useRegisteredRef();

  return (
    <TextInput
      ref={ref}
      style={styles.textInputStyle}
      value={value}
      placeholderTextColor={LIGHT_GREY}
      underlineColorAndroid={SUSSOL_ORANGE}
      placeholder={placeholder}
      selectTextOnFocus
      returnKeyType="next"
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={onChange}
      onSubmitEditing={() => focusController.next(ref)}
      editable={!disabled}
      blurOnSubmit={false}
      autoFocus={autofocus}
    />
  );
};

const styles = StyleSheet.create({
  textInputStyle: { flex: 1, fontFamily: APP_FONT_FAMILY },
});

Text.propTypes = {
  autofocus: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

Text.defaultProps = {
  autofocus: false,
  disabled: false,
  placeholder: '',
  value: '',
};
