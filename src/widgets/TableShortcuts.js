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
}) => {
  const Container = onPress ? TouchableOpacity : View;

  const wrappedOnPress = React.useCallback(() => onPress(shortcutKey), []);
  const renderChildren = React.useCallback(
    child => (typeof child === 'string' ? <Text style={textStyle}>{child}</Text> : child),
    []
  );

  return (
    <View onPress={wrappedOnPress} style={containerStyle}>
      <Container style={innerContainerStyle}>
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
    borderBottomColor: 'black',
    borderBottomWidth: 1,
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
    borderWidth: 1,
    borderColor: 'black',
  },
});

TableShortcut.defaultProps = {
  onPress: null,
  shortcutKey: '',

  innerContainerStyle: localStyles.innerShortcutContainer,
  textStyle: localStyles.shortcutText,
  containerStyle: localStyles.shortcutContainer,
};

TableShortcut.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  onPress: PropTypes.func,
  shortcutKey: PropTypes.string,
  containerStyle: PropTypes.object,
  innerContainerStyle: PropTypes.object,
  textStyle: PropTypes.object,
};

TableShortcuts.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
