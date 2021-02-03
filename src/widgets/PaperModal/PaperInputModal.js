import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

import { FlexView } from '../FlexView';
import { Spacer } from '../Spacer';
import {
  APP_FONT_FAMILY,
  DARKER_GREY,
  LIGHT_GREY,
  SUSSOL_ORANGE,
  WHITE,
} from '../../globalStyles/index';
import { useLayoutDimensions } from '../../hooks/useLayoutDimensions';

export const PaperInputModal = ({
  content,
  Icon,
  buttonText,
  placeholder,
  onButtonPress,
  validator,
}) => {
  const [width, , setDimensions] = useLayoutDimensions();
  const [input, setInput] = useState('');

  return (
    <FlexView flex={1} onLayout={setDimensions}>
      <FlexView flex={1} alignItems="center" justifyContent="space-evenly">
        <FlexView flex={0} alignItems="center" justifyContent="space-evenly">
          {Icon}

          <Spacer space={20} vertical horizontal={false} />

          <Text style={localStyles.contentText}>{content}</Text>
        </FlexView>

        <TextInput
          autoFocus
          placeholder={placeholder}
          underlineColorAndroid={SUSSOL_ORANGE}
          value={input}
          onChangeText={setInput}
          style={[localStyles.textInput, { width: width / 2 }]}
        />
      </FlexView>

      <TouchableOpacity
        onPress={() => onButtonPress(input)}
        style={[
          localStyles.button,
          { backgroundColor: validator(input) ? SUSSOL_ORANGE : LIGHT_GREY },
        ]}
      >
        <FlexView flex={1} style={{}} justifyContent="center" alignItems="center">
          <Text style={localStyles.buttonText}>{buttonText}</Text>
        </FlexView>
      </TouchableOpacity>
    </FlexView>
  );
};

const localStyles = StyleSheet.create({
  textInput: {
    color: SUSSOL_ORANGE,
    height: 50,
    fontSize: 14,
    fontWeight: '400',
  },
  button: {
    height: 50,
    backgroundColor: SUSSOL_ORANGE,
    width: '100%',
  },
  contentText: { fontSize: 14, color: DARKER_GREY, fontWeight: '400' },
  buttonText: { textAlign: 'center', fontSize: 22, color: WHITE, fontFamily: APP_FONT_FAMILY },
});

PaperInputModal.propTypes = {
  content: PropTypes.string.isRequired,
  Icon: PropTypes.node.isRequired,
  buttonText: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onButtonPress: PropTypes.func.isRequired,
  validator: PropTypes.func.isRequired,
};
