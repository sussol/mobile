import React from 'react';
import TouchableCell from './TouchableCell';

const CheckableCell = React.memo(
  ({
    rowKey,
    columnKey,
    isChecked,
    CheckedComponent,
    UncheckedComponent,
    disabled,
    onCheckAction,
    onUncheckAction,
    dispatch,
  }) => {
    console.log(`- CheckableCell: ${rowKey},${columnKey}`);

    const onPressAction = isChecked ? onUncheckAction : onCheckAction;

    const renderCheck = () =>
      isChecked ? (
        <CheckedComponent disabled={disabled} />
      ) : (
        <UncheckedComponent disabled={disabled} />
      );

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

export default CheckableCell;
