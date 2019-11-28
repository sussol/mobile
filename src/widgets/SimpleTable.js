/* eslint-disable react/forbid-prop-types */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View, FlatList, TouchableOpacity } from 'react-native';
import Cell from './DataTable/Cell';
import { dataTableStyles } from '../globalStyles/index';
import { HeaderCell, HeaderRow } from './DataTable/index';

const SimpleTable = React.memo(({ data, columns, selectRow, extraData }) => {
  const {
    cellText,
    cellContainer,
    selectedRow: selectedRowStyle,
    alternateRow: alternateRowStyle,
    row: basicRowStyle,
    headerRow,
    headerCells,
  } = dataTableStyles;

  const renderCells = useCallback(rowData => {
    const { id } = rowData;

    return columns.map(({ key, width, alignText }, index) => (
      <Cell
        value={rowData[key]}
        viewStyle={cellContainer[alignText]}
        textStyle={cellText[alignText]}
        isLastCell={index === columns.length - 1}
        width={width}
        key={`${id}${key}`}
      />
    ));
  }, []);

  const renderRow = useCallback(
    ({ item, index }) => {
      const { id } = item;
      const isSelected = extraData[id];
      const rowStyle = isSelected
        ? selectedRowStyle
        : (index % 2 === 0 && alternateRowStyle) || basicRowStyle;

      return (
        <SimpleRow
          rowData={item}
          rowIndex={index}
          rowKey={id}
          style={rowStyle}
          renderCells={renderCells}
          onPress={selectRow}
          isSelected={isSelected}
        />
      );
    },
    [extraData]
  );

  const renderHeaderCells = useCallback(
    () =>
      columns.map(({ title, width, alignText }, index) => (
        <HeaderCell
          title={title}
          containerStyle={headerCells[alignText]}
          textStyle={cellText[alignText]}
          isLastCell={index === columns.length - 1}
          width={width}
        />
      )),
    [columns]
  );

  const renderHeaders = useCallback(
    () => <HeaderRow style={headerRow} columns={columns} renderCells={renderHeaderCells} />,
    [columns]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderRow}
      stickyHeaderIndices={[0]}
      ListHeaderComponent={renderHeaders}
    />
  );
});

SimpleTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  selectRow: PropTypes.func.isRequired,
  extraData: PropTypes.object.isRequired,
};

const SimpleRow = React.memo(({ rowData, style, rowKey, renderCells, onPress }) => {
  const onSelect = useCallback(() => onPress(rowKey), [rowKey, onPress]);
  return (
    <TouchableOpacity onPress={onSelect} key={rowKey}>
      <View style={style}>{renderCells(rowData)}</View>
    </TouchableOpacity>
  );
});

SimpleRow.defaultProps = {
  onPress: null,
};

SimpleRow.propTypes = {
  rowData: PropTypes.object.isRequired,
  rowKey: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
  renderCells: PropTypes.func.isRequired,
  onPress: PropTypes.func,
};
