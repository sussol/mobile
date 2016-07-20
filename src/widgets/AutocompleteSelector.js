/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';

import { APP_FONT_FAMILY } from '../globalStyles';

/**
 * A search bar that autocompletes from the options passed in, and allows any of
 * the dropdown options to be selected
 * @prop  {array}     options         The options to select from
 * @prop  {function}  onSelect        A function taking the selected option as a parameter
 * @prop  {string}    queryString     The query to filter the options by, where $0 will
 *        														be replaced by the user's current search
 *        														e.g. 'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'
 * @prop  {string}    placeholderText The text to initially display in the search bar
 */
export class AutocompleteSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryText: '',
    };
  }

  render() {
    const {
      options,
      onSelect,
      queryString,
      placeholderText,
    } = this.props;

    return (
      <Autocomplete
        style={localStyles.text}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        data={options.filtered(queryString, this.state.queryText)}
        onChangeText={text => this.setState({ queryText: text })}
        placeholder={placeholderText}
        renderItem={(item) => (
          <TouchableOpacity onPress={() => onSelect(item)}>
            <Text style={[localStyles.text, localStyles.itemText]}>
              {item.toString()}
            </Text>
          </TouchableOpacity>
        )}
      />
     );
  }
}

AutocompleteSelector.propTypes = {
  options: React.PropTypes.object.isRequired,
  queryString: React.PropTypes.string.isRequired,
  placeholderText: React.PropTypes.string,
  onSelect: React.PropTypes.func.isRequired,
};
AutocompleteSelector.defaultProps = {
  placeholderText: 'Start typing to search',
};

const localStyles = StyleSheet.create({
  text: {
    fontSize: 15,
    fontFamily: APP_FONT_FAMILY,
  },
  itemText: {
    margin: 2,
  },
});
