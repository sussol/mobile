/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { APP_FONT_FAMILY, DARK_GREY, SUSSOL_ORANGE } from '../globalStyles';

const renderTitleComponent = (isEditingDisabled, columnIndex, color, rowData, rowIndex) => {
  // If null or empty string, use single space to avoid squishing row
  const titleString = rowData.title ? rowData.title : ' ';
  const style = { ...localStyles.text, ...localStyles.titleText, color };
  const titleComponent = (
    <Text key={`Title ${columnIndex}-${rowIndex}`} style={style} numberOfLines={1}>
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
      </TouchableOpacity>
    );
  }
  return (
    <View style={localStyles.rowContainer} key={`ViewTitle ${columnIndex}-${rowIndex}`}>
      {titleComponent}
    </View>
  );
};

const renderInfoComponent = (isEditingDisabled, columnIndex, color, rowData, rowIndex) => {
  let editTextStyle;
  let containerStyle;
  let iconName;
  const { editableType } = rowData;
  switch (editableType) {
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
  let infoString = (rowData.info || rowData.info === 0) && String(rowData.info);
  infoString = infoString && infoString.length > 0 ? infoString : ' ';
  const textStyle = { ...localStyles.text, ...editTextStyle, color };
  const infoComponent = (
    <Text key={`Info ${columnIndex}-${rowIndex}`} style={textStyle} numberOfLines={1}>
      {infoString}
    </Text>
  );
  if (rowData.onPress && !isEditingDisabled) {
    return (
      <TouchableOpacity
        style={localStyles.rowContainer}
        key={`Touchable ${columnIndex}-${rowIndex}`}
        onPress={rowData.onPress}
      >
        <View style={containerStyle}>
          <View style={{ maxWidth: '85%' }}>{infoComponent}</View>
          <View style={{ maxWidth: '10%' }}>
            <Icon name={iconName} size={14} color={SUSSOL_ORANGE} style={localStyles.editIcon} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <View style={localStyles.rowContainer} key={`ViewInfo ${columnIndex}-${rowIndex}`}>
      {infoComponent}
    </View>
  );
};

/**
 * A component to display info in a generic way at the top of a page.
 *
 * @prop  {array} columns   An array containing columns of information to be
 *                          displayed, with an entry in the array representing
 *                          a column, which is an array of info objects
 *                          containing a title and info.
 *
 *                          E.g.:
 *
 *                          [[{title: 'col1:', info: 'row1'},
 *                            {title: 'col1:', info: 'row2'}]
 *                           [{title: 'col2:', info: 'row1',
 *                             editableType: 'selectable'},
 *                            {title: 'col2:', info: 'row2',
 *                             editableType: 'text'}]]
 *
 *                          would display:
 *
 *                            col1: row1 col2: row1
 *                            col1: row2 col2: row2
 */
const PageInfoComponent = props => {
  const { columns, isEditingDisabled, titleColor, infoColor } = props;

  return (
    <View style={[localStyles.horizontalContainer]}>
      {columns.map((columnData, columnIndex) => {
        const isRightMostColumn = columnIndex === props.columns.length - 1;
        return (
          <View
            // TODO: use key which is not index.
            // eslint-disable-next-line react/no-array-index-key
            key={`Column ${columnIndex}`}
            style={
              isRightMostColumn ? localStyles.rightmostColumnContainer : localStyles.columnContainer
            }
          >
            <View>
              {columnData
                .filter(data => !data.shouldHide)
                .map((...args) =>
                  renderTitleComponent(isEditingDisabled, columnIndex, titleColor, ...args)
                )}
            </View>
            <View style={localStyles.infoContainer}>
              {columnData
                .filter(data => !data.shouldHide)
                .map((...args) =>
                  renderInfoComponent(isEditingDisabled, columnIndex, infoColor, ...args)
                )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export const PageInfo = React.memo(PageInfoComponent);

export default PageInfo;

PageInfoComponent.propTypes = {
  columns: PropTypes.array.isRequired,
  isEditingDisabled: PropTypes.bool,
  titleColor: PropTypes.string,
  infoColor: PropTypes.string,
};

PageInfoComponent.defaultProps = {
  isEditingDisabled: false,
  infoColor: SUSSOL_ORANGE,
  titleColor: DARK_GREY,
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
    justifyContent: 'space-between',
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
    fontSize: Dimensions.get('window').width / 80,
    fontFamily: APP_FONT_FAMILY,
    color: SUSSOL_ORANGE,
    marginTop: 4,
  },
  titleText: {
    color: DARK_GREY,
    marginRight: 25,
  },
  infoText: {
    alignSelf: 'stretch',
  },
});
