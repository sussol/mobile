/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from 'react-native-ui-components';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { complement } from 'set-manipulator';
import { APP_FONT_FAMILY } from '../globalStyles';
import { generalStrings } from '../localization';

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
export class AutocompleteSelector extends React.PureComponent {
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
      queryStringSecondary,
      sortByString,
      placeholderText,
      renderLeftText,
      renderRightText,
    } = this.props;

    let data = options
      .filtered(queryString, this.state.queryText)
      .sorted(sortByString)
      .slice();
    if (queryStringSecondary) {
      const secondQueryResult = options
        .filtered(queryStringSecondary, this.state.queryText)
        .sorted(sortByString);
      // Remove duplicates from secondQueryResult
      const secondaryData = complement(secondQueryResult, data);

      // Append secondary results to the first query results
      data = data.concat(secondaryData);
    }

    return (
      <View >
        <SearchBar
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          color={'white'}
          onChange={text => this.setState({ queryText: text })}
          placeholder={placeholderText}
          placeholderTextColor={'white'}
          style={[localStyles.text, localStyles.searchBar]}
        />
        {data.length > 0 && (
          <FlatList
            data={data}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ResultRow
                item={item}
                onPress={onSelect}
                renderLeftText={renderLeftText}
                renderRightText={renderRightText}
              />
            )}
            keyboardShouldPersistTaps="always"
            style={localStyles.resultlist}
          />
        )}
      </View>
    );
  }
}

AutocompleteSelector.propTypes = {
  options: PropTypes.object.isRequired,
  queryString: PropTypes.string.isRequired,
  queryStringSecondary: PropTypes.string,
  sortByString: PropTypes.string.isRequired,
  placeholderText: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  renderLeftText: PropTypes.func,
  renderRightText: PropTypes.func,
};
AutocompleteSelector.defaultProps = {
  placeholderText: generalStrings.start_typing_to_search,
};

class ResultRow extends React.PureComponent {
  render() {
    const { item, renderLeftText, renderRightText } = this.props;
    return (
      <TouchableOpacity style={localStyles.resultRow} onPress={() => this.props.onPress(item)}>
        <Text style={[localStyles.text, localStyles.itemText]}>
          {renderLeftText ? renderLeftText(item) : item.toString()}
        </Text>
        <Text style={[localStyles.text, localStyles.itemText]}>
          {renderRightText ? renderRightText(item) : null}
        </Text>
      </TouchableOpacity>
    );
  }
}

const localStyles = StyleSheet.create({
  resultlist: {
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderColor: '#b9b9b9',
    borderRadius: 1,
    borderWidth: 1,
  },
  searchBar: {
    flex: 1,
    color: 'white',
  },
  text: {
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
  },
  itemText: {
    marginHorizontal: 2,
    marginVertical: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
