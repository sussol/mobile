import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

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
 *        									[{title: 'col2:', info: 'row1', editableType: 'selectable'},
 *                           {title: 'col2:', info: 'row2', editableType: 'text'}
 *                          ]]
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
              {columnData.map((...args) =>
                renderTitleComponent(props.isEditingDisabled, columnIndex, ...args))}
            </View>
            <View style={localStyles.infoContainer}>
              {columnData.map((...args) =>
                renderInfoComponent(props.isEditingDisabled, columnIndex, ...args))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function renderTitleComponent(isEditingDisabled, columnIndex, rowData, rowIndex) {
  // If null or empty string, use single space to avoid squishing row
  const titleString = rowData.title ? rowData.title : ' ';
  const titleComponent = (
    <Text
      key={`Title ${columnIndex}-${rowIndex}`}
      style={[localStyles.text, localStyles.titleText]}
      numberOfLines={1}
    >
      {titleString}
    </Text>
  );
  if (rowData.onPress && !isEditingDisabled) {
    return (
      <TouchableOpacity
        style={localStyles.rowContainer}
        key={`Touchable ${columnIndex}-${rowIndex}`}
        onPress={rowData.onPress}
      >
        {titleComponent}
      </TouchableOpacity>);
  }
  return (
    <View style={localStyles.rowContainer}>
      {titleComponent}
    </View>
  );
}

function renderInfoComponent(isEditingDisabled, columnIndex, rowData, rowIndex) {
  let editTextStyle;
  let containerStyle;
  let iconName;
  switch (rowData.editableType) {
    case 'selectable':
      containerStyle = localStyles.selectContainer;
      iconName = 'angle-down';
      break;
    case 'text':
    default:
      containerStyle = localStyles.editableTextContainer;
      iconName = 'pencil';
      editTextStyle = localStyles.infoText;
      break;
  }
  // If null or empty string, use single space to avoid squishing row
  let infoString = rowData.info && String(rowData.info);
  infoString = infoString && infoString.length > 0 ? infoString : ' ';
  const infoComponent = (
    <Text
      key={`Info ${columnIndex}-${rowIndex}`}
      style={[localStyles.text, editTextStyle]}
      numberOfLines={1}
    >
      {infoString}
    </Text>);
  if (rowData.onPress && !isEditingDisabled) {
    return (
      <TouchableOpacity
        style={localStyles.rowContainer}
        key={`Touchable ${columnIndex}-${rowIndex}`}
        onPress={rowData.onPress}
      >
        <View style={containerStyle}>
          {infoComponent}
          <Icon
            name={iconName}
            size={14}
            style={localStyles.editIcon}
            color={SUSSOL_ORANGE}
          />
        </View>
      </TouchableOpacity>);
  }
  return (
    <View style={localStyles.rowContainer}>
      {infoComponent}
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
  rowContainer: {
    marginVertical: 1,
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
  editableTextContainer: {
    borderBottomWidth: 1,
    borderColor: SUSSOL_ORANGE,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  editIcon: {
    marginTop: 4,
    marginLeft: 4,
  },
  text: {
    fontSize: 16,
    fontFamily: APP_FONT_FAMILY,
    color: SUSSOL_ORANGE,
    marginTop: 4,
  },
  titleText: {
    color: DARK_GREY,
    marginRight: 25,
  },
  infoText: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
