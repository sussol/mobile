import React, {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/EvilIcons';

const defaultStyles = StyleSheet.create({
  container: {
    borderBottomColor: '#e95c30',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: 500,
    margin: 15,
  },
  searchBar: {
    height: 50,
    width: 500,
    fontSize: 20,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
});

export default function searchBar(props) {
  return (
    <View style={defaultStyles.container}>
      <Icon name="search" size={50} color="#e95c30" />
      <TextInput
        style={props.style}
        onChange={(event) => props.onChange(event)}
      />
    </View>
  );
}

searchBar.propTypes = {
  style: TextInput.propTypes.style,
  onChange: React.PropTypes.func,
};

searchBar.defaultProps = {
  style: defaultStyles.searchBar,
};
