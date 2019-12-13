/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../globalStyles';

export const TableShortcut = ({
  children,
  onPress,
  shortcutKey,
  containerStyle,
  innerContainerStyle,
  textStyle,
  extraLarge,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  const internalStyle = extraLarge
    ? { ...containerStyle, flex: containerStyle.flex * 2 }
    : containerStyle;

  const wrappedOnPress = React.useCallback(() => onPress(shortcutKey), []);
  const renderChildren = React.useCallback(
    child => (typeof child === 'string' ? <Text style={textStyle}>{child}</Text> : child),
    []
  );

  return (
    <View style={internalStyle}>
      <Container onPress={wrappedOnPress} style={innerContainerStyle}>
        {React.Children.map(children, renderChildren)}
      </Container>
    </View>
  );
};

export const TableShortcuts = ({ children }) => {
  const { shortcutsContainer } = localStyles;
  return <View style={shortcutsContainer}>{children}</View>;
};

const localStyles = StyleSheet.create({
  container: {},
  shortcutContainer: {
    flex: 1,
  },
  innerShortcutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shotCutText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
  },
  shortcutsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
});

TableShortcut.defaultProps = {
  onPress: null,
  shortcutKey: '',
  innerContainerStyle: localStyles.innerShortcutContainer,
  textStyle: localStyles.shortcutText,
  extraLarge: false,
  containerStyle: localStyles.shortcutContainer,
};

TableShortcut.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  onPress: PropTypes.func,
  shortcutKey: PropTypes.string,
  containerStyle: PropTypes.object,
  innerContainerStyle: PropTypes.object,
  textStyle: PropTypes.object,
  extraLarge: PropTypes.bool,
};

TableShortcuts.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
