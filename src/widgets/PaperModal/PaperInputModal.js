import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { FlexView } from '../FlexView';
import { Spacer } from '../Spacer';
import { APP_FONT_FAMILY, DARKER_GREY, SUSSOL_ORANGE, WHITE } from '../../globalStyles/index';
import { useLayoutDimensions } from '../../hooks/useLayoutDimensions';

export const PaperInputModal = ({ content, Icon, children, buttonText, onButtonPress }) => {
  const [width, , setDimensions] = useLayoutDimensions();

  return (
    <FlexView flex={1} onLayout={setDimensions}>
      <FlexView flex={1} alignItems="center" justifyContent="space-evenly">
        <FlexView flex={1} alignItems="center" justifyContent="flex-end">
          {Icon}

          <Spacer space={20} vertical horizontal={false} />

          <Text style={localStyles.contentText}>{content}</Text>
        </FlexView>
        <FlexView
          flex={2}
          alignItems="center"
          justifyContent="center"
          style={{ width: '100%', paddingHorizontal: width / 8 }}
        >
          {children}
        </FlexView>
      </FlexView>

      <TouchableOpacity onPress={onButtonPress} style={localStyles.button}>
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
  onButtonPress: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]).isRequired,
};
