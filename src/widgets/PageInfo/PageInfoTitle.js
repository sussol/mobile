import React from 'react';
import { Text, TouchableOpacity, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import { SUSSOL_ORANGE, APP_FONT_FAMILY } from '../../globalStyles';
import { FlexRow } from '../FlexRow';

export const PageInfoTitle = ({ isDisabled, color, onPress, title, numberOfLines, textAlign }) => {
  const style = { ...localStyles.text, ...localStyles.titleText, color, textAlign };
  const editable = onPress && !isDisabled;
  const Container = editable ? TouchableOpacity : FlexRow;

  return (
    <Container onPress={onPress} style={{ flex: 1.5 }}>
      <Text style={style} numberOfLines={numberOfLines}>
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
    marginRight: 10,
    flex: 1,
  },
};

PageInfoTitle.defaultProps = {
  onPress: null,
  isDisabled: false,
  numberOfLines: 1,
  textAlign: 'left',
};

PageInfoTitle.propTypes = {
  isDisabled: PropTypes.bool,
  onPress: PropTypes.func,
  color: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  numberOfLines: PropTypes.number,
  textAlign: PropTypes.string,
};
