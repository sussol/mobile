import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import {
  APP_FONT_FAMILY,
  DARK_GREY,
  SEARCH_BAR_WIDTH,
  SUSSOL_ORANGE,
} from '../globalStyles';

/**
 * A component to display info in a generic way at the top of a page
 * @prop  {array} columns   An array containing columns of information to be displayed,
 *        									with an entry in the array representing a column, which in
 *        									turn is an array of info objects containing a title and info.
 *        									E.g.
 *        									[[{title: 'col1', info: 'row1'}, {title: 'col1', info: 'row2'}],
 *        									[{title: 'col2', info: 'row1'}, {title: 'col2', info: 'row2'}]]
 *        									would display
 *        									col1: row1   col2: row1
 *        									col1: row2   col2: row2
 */
export function PageInfo(props) {
  return (
    <View
      style={[localStyles.horizontalContainer]}
    >
      {props.columns.map((columnData, columnIndex) =>
          <View
            key={`Column ${columnIndex}`}
            style={localStyles.columnContainer}
          >
            <View>
              {columnData.map((rowData, rowIndex) =>
                <Text
                  key={`Title ${columnIndex}-${rowIndex}`}
                  style={[localStyles.text, localStyles.titleText]}
                >
                  {rowData.title ? rowData.title : ' ' /** Space if null to avoid squishing row **/}
                </Text>)}
            </View>
            <View style={localStyles.infoContainer}>
              {columnData.map((rowData, rowIndex) =>
                <Text
                  key={`Info ${columnIndex}-${rowIndex}`}
                  style={localStyles.text}
                >
                  {rowData.info ? rowData.info : ' ' /** Space if null to avoid squishing row **/}
                </Text>)}
            </View>
          </View>)}
    </View>
  );
}

PageInfo.propTypes = {
  columns: React.PropTypes.array,
};

const localStyles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: SEARCH_BAR_WIDTH,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  columnContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  infoContainer: {
    marginHorizontal: 16,
  },
  text: {
    fontSize: 12,
    fontFamily: APP_FONT_FAMILY,
    color: SUSSOL_ORANGE,
    marginBottom: 4,
  },
  titleText: {
    color: DARK_GREY,
    marginRight: 10,
  },
});
