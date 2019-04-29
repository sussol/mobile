/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Dimensions, StyleSheet, FlatList, View, Text } from 'react-native';
import { ROW_BLUE, APP_FONT_FAMILY, SUSSOL_ORANGE, DARK_GREY } from '../globalStyles/index';

/**
 * Simple table component only rendering scalar values in a cell. Not intended
 * for entering data. Below are frequently used props. Many other props are
 * available for styling, documented in PropTypes.
 * @prop    {array}  data    Array of data. Example below.
 * @prop    {array}  columns Array of column objects. Example below.
 * @prop    {string} title   Title for this table.
 *
 * data = [ { a: 1, b: 2}, {a: 3, b: 4}, .. ]
 * Simple objects with key/values pairs corresponding to each column. Values
 * must be simple scalar values, unless the corresponding column has a formatMethod
 *
 * columns = [ { key: 'a', width: 1, title: 'A COLUMN' },
 *             { key: 'b', width: 1, title: 'B COLUMN', formatMethod: () => {} }
 * ]
 * formatMethod: e.g. (value) => value.toLocaleDateString()
 *
 * Objects using flex to scale width and a key to find the correct data for each
 * row. If the value being passed in the data object is not a simple scalar value,
 * a formatMethod can be passed to transform it to one.
 */
export class SimpleTable extends React.PureComponent {
  keyExtractor = ({ index }) => index;

  renderTitle = () => {
    const { title } = this.props;
    const { titleContainer, titleFont } = localStyles(this.props);
    return (
      <View style={titleContainer}>
        <Text style={titleFont}>{title}</Text>
      </View>
    );
  };

  renderCell = ({ content, rowIndex, header, width, cellIndex, formatMethod, isLastCell }) => {
    const { cell, cellFont } = localStyles({ ...this.props, rowIndex, header, width, isLastCell });
    return (
      <View style={cell} key={this.keyExtractor({ index: cellIndex })}>
        <Text style={cellFont}>{formatMethod ? formatMethod(content) : content}</Text>
      </View>
    );
  };

  renderHeaderRow = () => {
    const { columns } = this.props;
    const { headerColumn } = localStyles(this.props);
    return (
      <View style={headerColumn}>
        {columns.map((column, cellIndex) => {
          const { title: content, width } = column;
          const isLastCell = columns.length === cellIndex + 1;
          return this.renderCell({ content, column, width, header: true, isLastCell });
        })}
      </View>
    );
  };

  renderRow = ({ item, index: rowIndex }) => {
    const { columns } = this.props;
    const { row } = localStyles(this.props);
    return (
      <View style={row}>
        {columns.map((column, cellIndex) => {
          const { key, width, formatMethod } = column;
          const content = item[key];
          const isLastCell = columns.length === cellIndex + 1;
          return this.renderCell({
            content,
            column,
            width,
            cellIndex,
            rowIndex,
            formatMethod,
            isLastCell,
          });
        })}
      </View>
    );
  };

  render() {
    const { data, title, keyExtractor } = this.props;
    const { container } = localStyles(this.props);
    return (
      <View style={container}>
        {title && this.renderTitle()}
        {this.renderHeaderRow()}
        <FlatList
          data={data}
          renderItem={this.renderRow}
          keyExtractor={keyExtractor || this.keyExtractor}
        />
      </View>
    );
  }
}

const localStyles = ({
  rowIndex,
  header,
  width,
  cellFontColor,
  titleHeight,
  rowHeight,
  backgroundColor,
  headerFontColor,
  titleFontColor,
  titleFontStyle,
  headerHeight,
  titleBackgroundColor,
  containerBackground,
  columnSeperatorColor,
  isLastCell,
  data,
} = {}) =>
  StyleSheet.create({
    container: {
      backgroundColor: containerBackground,
      height: rowHeight * data.length + headerHeight + titleHeight + 5,
      width: '100%',
    },
    titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      maxHeight: titleHeight,
      minHeight: titleHeight,
      backgroundColor: titleBackgroundColor,
      marginBottom: 1,
    },
    titleFont: {
      fontSize: Dimensions.get('window').width / 80,
      fontFamily: APP_FONT_FAMILY,
      color: titleFontColor,
      ...titleFontStyle,
    },
    headerColumn: {
      display: 'flex',
      flexDirection: 'row',
      marginBottom: 1,
      height: headerHeight,
      backgroundColor,
    },
    row: {
      flex: 1,
      flexDirection: 'row',
      height: rowHeight,
      marginBottom: 1,
      backgroundColor: 'white',
    },
    cellFont: {
      fontFamily: APP_FONT_FAMILY,
      fontSize: Dimensions.get('window').width / 100,
      color: header ? headerFontColor : cellFontColor,
    },
    cell: {
      flex: width,
      justifyContent: 'center',
      alignItems: 'center',
      borderRightColor: columnSeperatorColor,
      borderRightWidth: isLastCell ? 0 : 2,
      backgroundColor: rowIndex % 2 === 0 ? ROW_BLUE : 'white',
    },
  });

SimpleTable.defaultProps = {
  title: null,
  titleHeight: 40,
  titleBackgroundColor: 'white',
  titleFontColor: SUSSOL_ORANGE,
  titleFontStyle: {},
  rowHeight: 30,
  headerFontColor: DARK_GREY,
  headerHeight: 35,
  cellFontColor: DARK_GREY,
  backgroundColor: 'white',
  columnSeperatorColor: '#ecf3fc',
  keyExtractor: null,
};

SimpleTable.propTypes = {
  titleHeight: PropTypes.number,
  titleFontColor: PropTypes.string,
  titleFontStyle: PropTypes.object,
  titleBackgroundColor: PropTypes.string,
  rowHeight: PropTypes.number,
  backgroundColor: PropTypes.string,
  headerFontColor: PropTypes.string,
  headerHeight: PropTypes.number,
  cellFontColor: PropTypes.string,
  columnSeperatorColor: PropTypes.string,
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  title: PropTypes.string,
  keyExtractor: PropTypes.func,
};

export default SimpleTable;
