import React, {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/EvilIcons';
import globalStyles from '../globalStyles';

const defaultStyles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
  },
  textInput: {
    height: 50,
    width: 500,
    fontSize: 20,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
});

defaultStyles.textInput = [defaultStyles.textInput, globalStyles.appFontFamily];
defaultStyles.container = [defaultStyles.container, globalStyles.appOrangeBorder];

export default function searchBar(props) {
  return (
    <View style={defaultStyles.container}>
      <Icon name="search" size={45} color="#e95c30" />
      <TextInput
        {...props}
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
  style: defaultStyles.textInput,
};
