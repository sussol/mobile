
/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ListView } from 'realm/react-native';

export default function DataTable(props) {
  const {
    style,
    listViewStyle,
    searchBar,
    searchBarStyle,
    renderHeader,
    dataSource,
    renderRow,
    ...listViewProps,
  } = props;
  return (
    <View style={[defaultStyles.verticalContainer, style]}>
      {
        (typeof searchBar === 'function') &&
          <TextInput
            style={[defaultStyles.searchBar, searchBarStyle]}
            onChange={(event) => searchBar(event)}
            placeholder="Search"
          />
      }
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
  style: React.PropTypes.number,
  listViewStyle: React.PropTypes.number,
  searchBar: React.PropTypes.func,
  searchBarStyle: React.PropTypes.number,
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
  searchBar: {
    backgroundColor: '#86e6f4',
  },
  listView: {
    flex: 1,
  },
});
