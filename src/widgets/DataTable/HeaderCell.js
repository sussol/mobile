import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, StyleSheet, View, TouchableOpacityPropTypes } from 'react-native';

/**
 * Simple component to be used in conjunction with HeaderRow component.
 *
 * Renders a title and if passed, a sorting icon.
 *
 * @prop {String}       title                 Text to display in the cell
 * @prop {String}       columnKey             The key for the column the cell heads.
 * @prop {Func}         onPressAction         Action for dispatching on press
 * @prop {Func}         dispatch              Dispatcher to backing reducer
 * @prop {ReactElement} SortAscComponent      Icon component for ascending sorting
 * @prop {ReactElement} SortDescComponent     Icon component for descending sorting
 * @prop {ReactElement} SortNeutralComponent  Icon component for neutral state, no sort.
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
