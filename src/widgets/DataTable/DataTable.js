
/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  View,
} from 'react-native';

import { ListView } from 'realm/react-native';

export function DataTable(props) {
  const {
    style,
    listViewStyle,
    renderHeader,
    dataSource,
    renderRow,
    ...listViewProps,
  } = props;
  return (
    <View style={[defaultStyles.verticalContainer, style]}>
      {typeof renderHeader === 'function' && renderHeader()}
      <ListView
        {...listViewProps}
        style={[defaultStyles.listview, listViewStyle]}
        dataSource={dataSource}
        renderRow={renderRow}
      />
    </View>
  );
}

DataTable.propTypes = {
  style: React.View.propTypes.style,
  listViewStyle: React.PropTypes.number,
  renderHeader: React.PropTypes.func,
  dataSource: React.PropTypes.object.isRequired,
  renderRow: React.PropTypes.func.isRequired,
};
DataTable.defaultProps = {
  showsVerticalScrollIndicator: true,
  scrollRenderAheadDistance: 5000,
};

const defaultStyles = StyleSheet.create({
  verticalContainer: {
    flex: 1,
  },
  listView: {
    flex: 1,
  },
});
