import React, {
  PropTypes,
} from 'react';

import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import globalStyles from '../globalStyles';
import Icon from 'react-native-vector-icons/EvilIcons';

export default function searchBar(props) {
  return (
    <View style={styles.container}>
      <Icon name="search" size={30} color="#e95c30" />
      <TextInput
        style={styles.searchBar}
        onChange={(event) => this.onSearchChange(event)}
        placeholder="Search"
      />
    </View>
  );
}

searchBar.propTypes = {
  style: TextInput.propTypes.style,
};

searchBar.defaultProps = {
  style: globalStyles.searchBar,
};

const styles = StyleSheet.create({
  container: {
    borderBottomColor: '#e95c30',
    borderBottomWidth: 1,
    flexDirection: 'row',
    width: 500,
    padding: 15,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
});
