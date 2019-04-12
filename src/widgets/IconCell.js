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
 * Simple stateless component which renders some text and and an
 * icon in a cell with an optional onPress. Setitng disabled to
 * true changes the colour scheme.
 *
 */
export class IconCell extends React.PureComponent {
  getComponent = () => {
    const { text, icon, disabled } = this.props;
    const { mainContainer, textContainer, iconContainer, font } = getLocalStyles(disabled);
    return (
      <View style={mainContainer}>
        <View style={textContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={font}>
            {text}
          </Text>
        </View>

        <View style={iconContainer}>
          <Icon name={icon} size={20} color={disabled ? SOFT_RED : SUSSOL_ORANGE} />
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

const getLocalStyles = disabled =>
  StyleSheet.create({
    mainContainer: {
      display: 'flex',
      flexDirection: 'row',
      marginHorizontal: 10,
    },
    textContainer: {
      width: '75%',
      fontFamily: APP_FONT_FAMILY,
    },
    iconContainer: {
      width: '20%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    font: { fontFamily: APP_FONT_FAMILY, color: disabled ? SOFT_RED : DARK_GREY },
  });

IconCell.defaultProps = {
  text: '',
  icon: 'caret-up',
  disabled: false,
  onPress: null,
};

IconCell.propTypes = {
  text: PropTypes.string,
  onPress: PropTypes.func,
  icon: PropTypes.string,
  disabled: PropTypes.bool,
};

export default IconCell;
