import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import {
  APP_FONT_FAMILY,
  DARK_GREY,
  SUSSOL_ORANGE,
} from '../globalStyles';

/**
 * A component to display info in a generic way at the top of a page
 * @prop  {array} columns   An array containing columns of information to be displayed,
 *        									with an entry in the array representing a column, which in
 *        									turn is an array of info objects containing a title and info.
 *        									E.g.
 *        									[[{title: 'col1:', info: 'row1'}, {title: 'col1:', info: 'row2'}],
 *        									[{title: 'col2:', info: 'row1'}, {title: 'col2:', info: 'row2'}]]
 *        									would display
 *        									col1: row1   col2: row1
 *        									col1: row2   col2: row2
 */
export function PageInfo(props) {
  return (
    <View
      style={[localStyles.horizontalContainer]}
    >
      {props.columns.map((columnData, columnIndex) => {
        const isRightMostColumn = columnIndex === props.columns.length - 1;
        return (
          <View
            key={`Column ${columnIndex}`}
            style={isRightMostColumn ?
                   localStyles.rightmostColumnContainer :
                   localStyles.columnContainer}
          >
            <View>
              {columnData.map((rowData, rowIndex) => {
                // If null or empty string, use single space to avoid squishing row
                const titleString = rowData.title ? rowData.title : ' ';
                return (
                  <Text
                    key={`Title ${columnIndex}-${rowIndex}`}
                    style={[localStyles.text, localStyles.titleText]}
                    numberOfLines={1}
                  >
                    {titleString}
                  </Text>
                );
              })}
            </View>
            <View style={localStyles.infoContainer}>
              {columnData.map((rowData, rowIndex) => {
                // If null or empty string, use single space to avoid squishing row
                const infoString = rowData.info && rowData.info.length > 0 ? rowData.info : ' ';
                const textComponent = (
                  <Text
                    key={`Info ${columnIndex}-${rowIndex}`}
                    style={localStyles.text}
                    numberOfLines={1}
                  >
                    {infoString}
                  </Text>);
                if (rowData.onPress && !props.isEditingDisabled) {
                  return (
                    <TouchableHighlight
                      key={`Touchable ${columnIndex}-${rowIndex}`}
                      onPress={rowData.onPress}
                    >
                      {textComponent}
                    </TouchableHighlight>);
                }
                return textComponent;
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

PageInfo.propTypes = {
  columns: React.PropTypes.array,
  isEditingDisabled: React.PropTypes.bool,
};

const localStyles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  columnContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginRight: 25,
  },
  rightmostColumnContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginRight: 5,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    fontSize: 12,
    fontFamily: APP_FONT_FAMILY,
    color: SUSSOL_ORANGE,
    marginBottom: 4,
  },
  titleText: {
    color: DARK_GREY,
    marginRight: 25,
  },
});
