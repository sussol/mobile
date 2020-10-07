import React from 'react';
import { Text, TouchableOpacity, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import { SUSSOL_ORANGE, APP_FONT_FAMILY } from '../../globalStyles';
import { FlexRow } from '../FlexRow';

export const PageInfoTitle = ({ isDisabled, color, onPress, title }) => {
  const style = { ...localStyles.text, ...localStyles.titleText, color };
  const editable = onPress && !isDisabled;
  const Container = editable ? TouchableOpacity : FlexRow;

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

PageInfoTitle.defaultProps = {
  onPress: null,
  isDisabled: false,
};

PageInfoTitle.propTypes = {
  isDisabled: PropTypes.bool,
  onPress: PropTypes.func,
  color: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
