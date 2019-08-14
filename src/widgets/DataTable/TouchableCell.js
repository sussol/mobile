import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityPropTypes } from 'react-native';

const TouchableCell = React.memo(
  ({
    value,
    rowKey,
    columnKey,
    onPressAction,
    dispatch,
    renderChildren,
    TouchableComponent,
    ...otherProps
  }) => {
    console.log(`- TouchableCell: ${rowKey},${columnKey}`);

    const onPress = () => {
      dispatch(onPressAction(rowKey, columnKey));
    };

    const Container = TouchableComponent || TouchableOpacity;
    const content = renderChildren ? renderChildren(value) : <Text>{value}</Text>;

    return (
      <Container style={defaultStyles.touchableCell} onPress={onPress} {...otherProps}>
        {content}
      </Container>
    );
  }
);

TouchableCell.propTypes = {
  ...TouchableOpacityPropTypes,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onPressAction: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  renderChildren: PropTypes.func.isRequired,
  TouchableComponent: PropTypes.func.isRequired,
};

TouchableCell.defaultProps = {
  value: '',
};

const defaultStyles = StyleSheet.create({
  touchableCell: {
    flex: 1,
    backgroundColor: 'turquoise',
    justifyContent: 'center',
  },
});

export default TouchableCell;
