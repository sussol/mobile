import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import globalStyles, {
  APP_FONT_FAMILY,
  DARK_GREY,
  SEARCH_BAR_WIDTH,
  SUSSOL_ORANGE,
} from '../globalStyles';

export function PageInfo(props) {
  return (
    <View
      style={[localStyles.horizontalContainer]}
    >
      {props.columns.map((columnData, index) =>
          <View
            key={`Column ${index}`}
            style={localStyles.columnContainer}
          >
            <View>
              {columnData.map((rowData) =>
                <Text
                  key={rowData.title}
                  style={[localStyles.text, localStyles.titleText]}
                >
                  {rowData.title}
                </Text>)}
            </View>
            <View style={localStyles.infoContainer}>
              {columnData.map((rowData) =>
                <Text
                  key={rowData.info}
                  style={localStyles.text}
                >
                  {rowData.info}
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
