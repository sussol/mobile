import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, StyleSheet, View, TouchableOpacityPropTypes } from 'react-native';

/**
 *
 */
const HeaderCell = React.memo(
  ({
    title,
    columnKey,
    sortDirection,
    SortAscComponent,
    SortDescComponent,
    SortNeutralComponent,
    onPressAction,
    dispatch,
    ...otherProps
  }) => {
    const onPress = () => {
      dispatch(onPressAction(columnKey));
    };

    const Icon = () => {
      switch (sortDirection) {
        case 'ASC': {
          return SortAscComponent;
        }
        case 'DESC': {
          return SortDescComponent;
        }
        default: {
          return SortNeutralComponent;
        }
      }
    };

    const Container = onPressAction ? View : TouchableOpacity;

    return (
      <Container style={defaultStyles.headerCell} onPress={onPress} {...otherProps}>
        <Text>{title}</Text>
        {onPressAction && <Icon />}
      </Container>
    );
  }
);

HeaderCell.propTypes = {
  ...TouchableOpacityPropTypes,
  title: PropTypes.string.isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onPressAction: PropTypes.func,
  dispatch: PropTypes.func,
  sortDirection: PropTypes.oneOf(['ASC', 'DESC']),
  SortAscComponent: PropTypes.element,
  SortDescComponent: PropTypes.element,
  SortNeutralComponent: PropTypes.element,
};

HeaderCell.defaultProps = {
  dispatch: null,
  onPressAction: null,
  sortDirection: null,
  SortAscComponent: null,
  SortDescComponent: null,
  SortNeutralComponent: null,
};

const defaultStyles = StyleSheet.create({
  headerCell: {
    flex: 1,
    backgroundColor: 'turquoise',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default HeaderCell;
