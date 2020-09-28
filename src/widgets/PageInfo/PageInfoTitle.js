import React from 'react';
import { Text, TouchableOpacity, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import { SUSSOL_ORANGE, APP_FONT_FAMILY } from '../../globalStyles';
import { FlexRow } from '../FlexRow';

export const PageInfoTitle = ({ isDisabled, colour, onPress, title }) => {
  const style = { ...localStyles.text, ...localStyles.titleText, colour };
  const disabled = onPress && !isDisabled;
  const Container = disabled ? FlexRow : TouchableOpacity;

  return (
    <Container onPress={onPress} style={{ flex: 2 }}>
      <Text style={style} numberOfLines={1}>
        {title}
      </Text>
    </Container>
  );
};

const localStyles = {
  text: {
    fontSize: Dimensions.get('window').width / 80,
    fontFamily: APP_FONT_FAMILY,
    color: SUSSOL_ORANGE,
  },
};

PageInfoTitle.propTypes = {
  isDisabled: PropTypes.bool.isRequired,
  colour: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};
