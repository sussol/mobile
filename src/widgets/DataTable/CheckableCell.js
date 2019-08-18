import React from 'react';
import PropTypes from 'prop-types';

import TouchableCell from './TouchableCell';

const CheckableCell = React.memo(
  ({
    rowKey,
    columnKey,
    isChecked,
    isDisabled,
    CheckedComponent,
    UncheckedComponent,
    DisabledCheckedComponent,
    DisabledUncheckedComponent,
    onCheckAction,
    onUncheckAction,
    dispatch,
  }) => {
    console.log(`- CheckableCell: ${rowKey},${columnKey}`);

    const onPressAction = isChecked ? onUncheckAction : onCheckAction;

    const renderCheck = () => {
      if (isDisabled) {
        return isChecked ? DisabledCheckedComponent : DisabledUncheckedComponent;
      }
      return isChecked ? CheckedComponent : UncheckedComponent;
    };

    return (
      <TouchableCell
        renderChildren={renderCheck}
        rowKey={rowKey}
        columnKey={columnKey}
        onPressAction={onPressAction}
        dispatch={dispatch}
      />
    );
  }
);

CheckableCell.propTypes = {
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isChecked: PropTypes.bool,
  isDisabled: PropTypes.bool,
  CheckedComponent: PropTypes.element.isRequired,
  UncheckedComponent: PropTypes.element.isRequired,
  DisabledCheckedComponent: PropTypes.element,
  DisabledUncheckedComponent: PropTypes.element,
  onCheckAction: PropTypes.func.isRequired,
  onUncheckAction: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

CheckableCell.defaultProps = {
  isChecked: false,
  DisabledCheckedComponent: null,
  DisabledUncheckedComponent: null,
  isDisabled: false,
};

export default CheckableCell;
