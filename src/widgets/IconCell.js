/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { SUSSOL_ORANGE, APP_FONT_FAMILY, DARK_GREY, SOFT_RED } from '../globalStyles/index';

/**
 * Simple stateless component which renders either:
 * some text, left aligned and ellipsis overflow and a right aligned icon
 * or, a centered icon with optional colors.
 * Default styles are dark grey text, soft red when disabled with an
 * orange up-caret icon.
 */
export class IconCell extends React.PureComponent {
  getComponent = () => {
    const { text, icon, disabled, iconSize, iconColor } = this.props;
    const styleParameters = { disabled, text };
    const { mainContainer, textContainer, iconContainer, font } = getLocalStyles(styleParameters);
    return (
      <View style={mainContainer}>
        <View style={textContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={font}>
            {text}
          </Text>
        </View>

        <View style={iconContainer}>
          <Icon name={icon} size={iconSize} color={iconColor} />
        </View>
      </View>
    );
  };

  render() {
    const { onPress, disabled } = this.props;
    const component = this.getComponent();
    if (disabled) return component;
    return <TouchableOpacity onPress={onPress}>{component}</TouchableOpacity>;
  }
}

const getLocalStyles = ({ disabled, text }) =>
  StyleSheet.create({
    mainContainer: {
      display: 'flex',
      flexDirection: 'row',
      marginHorizontal: 10,
    },
    textContainer: {
      width: text ? '75%' : '0%',
      fontFamily: APP_FONT_FAMILY,
    },
    iconContainer: {
      width: text ? '20%' : '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: text ? 'flex-end' : 'center',
    },
    font: { fontFamily: APP_FONT_FAMILY, color: disabled ? SOFT_RED : DARK_GREY },
  });

IconCell.defaultProps = {
  text: '',
  icon: 'caret-up',
  disabled: false,
  onPress: null,
  iconColor: SUSSOL_ORANGE,
  iconSize: 20,
};

IconCell.propTypes = {
  text: PropTypes.string,
  onPress: PropTypes.func,
  icon: PropTypes.string,
  disabled: PropTypes.bool,
  iconColor: PropTypes.string,
  iconSize: PropTypes.number,
};

export default IconCell;
