import React from 'react';
import PropTypes from 'prop-types';

import { TouchableOpacity, Dimensions, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FlexRow } from '../FlexRow';

import { APP_FONT_FAMILY, SUSSOL_ORANGE } from '../../globalStyles';

export const PageInfoDetail = ({
  isEditingDisabled,
  onPress,
  info,
  type,
  color,
  numberOfLines,
}) => {
  const editable = onPress && !isEditingDisabled;
  const border = editable && type === 'text' ? localStyles.bottomBorder : {};
  const iconLookups = { selectable: 'angle-down', text: 'pencil', date: 'calendar' };
  const iconName = iconLookups[type ?? 'text'];
  const Container = editable ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} style={{ flex: 3 }}>
      <FlexRow justifyContent="space-between" style={border}>
        <Text style={{ ...localStyles.text, color }} numberOfLines={numberOfLines}>
          {info}
        </Text>

        {editable ? (
          <Icon name={iconName} size={14} color={SUSSOL_ORANGE} style={{ flex: 1 }} />
        ) : null}
      </FlexRow>
    </Container>
  );
};

export const localStyles = {
  bottomBorder: {
    borderBottomWidth: 1,
    borderColor: SUSSOL_ORANGE,
  },
  text: {
    fontSize: Dimensions.get('window').width / 80,
    fontFamily: APP_FONT_FAMILY,
    color: SUSSOL_ORANGE,
    flex: 9,
  },
};

PageInfoDetail.defaultProps = {
  isEditingDisabled: false,
  info: '',
  type: '',
  onPress: null,
  numberOfLines: 1,
};

PageInfoDetail.propTypes = {
  isEditingDisabled: PropTypes.bool,
  onPress: PropTypes.func,
  info: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.string,
  color: PropTypes.string.isRequired,
  numberOfLines: PropTypes.number,
};
