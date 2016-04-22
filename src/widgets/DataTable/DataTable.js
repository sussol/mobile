
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
  return (
    <View style={styles.verticalContainer}>
      {
        (typeof props.searchBar === 'function') &&
          <TextInput
            style={styles.searchBar}
            onChange={(event) => props.searchBar(event)}
            placeholder="Search"
          />
      }
      {typeof props.renderHeader === 'function' && props.renderHeader()}
      <ListView
        style={styles.listview}
        dataSource={props.dataSource}
        renderRow={props.renderRow}
        showsVerticalScrollIndicator
        scrollRenderAheadDistance={5000}
      />
    </View>
  );
}

DataTable.propTypes = {
  searchBar: React.PropTypes.func,
  renderHeader: React.PropTypes.func,
  dataSource: React.PropTypes.object.isRequired,
  renderRow: React.PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  verticalContainer: {
    flex: 1,
  },
});
