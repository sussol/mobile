/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// eslint-disable-next-line max-classes-per-file
import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from 'react-native-ui-components';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { complement } from 'set-manipulator';
import { APP_FONT_FAMILY } from '../globalStyles';
import { generalStrings } from '../localization/index';
import { withOnePress } from './withOnePress';

/**
 * A search bar that autocompletes from the options passed in, and allows any of
 * the dropdown options to be selected. Will gracefully handle null values
 * by using an empty array of searchable objects.
 * @prop  {array}     options         The options to select from
 * @prop  {function}  onSelect        A function taking the selected option as a parameter
 * @prop  {string}    queryString     The query to filter the options by, where $0 will
 *                                    be replaced by the user's current search
 *                                    e.g. 'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'
 * @prop  {string}    placeholderText The text to initially display in the search bar
 */
export class AutocompleteSelector extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      queryText: '',
    };
  }

  /**
   * Filters a realm results object. Creates two realm results A, B
   * by two query strings. And concats A to B - A.
   */
  filterResultData = options => {
    const { sortKeyString, queryString, queryStringSecondary } = this.props;
    const { queryText } = this.state;

    let data = options
      .filtered(queryString, queryText)
      .sorted(sortKeyString)
      .slice();

    if (queryStringSecondary) {
      data = data.concat(
        complement(options.filtered(queryStringSecondary, queryText).sorted(sortKeyString), data)
      );
    }

    return data;
  };

  /**
   * Filters an array by two filter properties, and user input query text.
   * Ignores case. Querying a realm result with filtered is more performant,
   * so have two cases for each.
   */
  filterArrayData = options => {
    const { primaryFilterProperty, secondaryFilterProperty } = this.props;
    const { queryText } = this.state;

    const regexFilter = RegExp(queryText, 'i');

    return options.filter(
      optionItem =>
        regexFilter.test(optionItem[primaryFilterProperty]) ||
        regexFilter.test(optionItem[secondaryFilterProperty])
    );
  };

  /**
   * Delegator of filtering process. Check if the object is a realm
   * object (has the filtered member) or if it is an array. Otherwise,
   * return an empty list to display.
   */
  getData = () => {
    const { options, primaryFilterProperty, queryString } = this.props;
    if (options && options.filtered && queryString) return this.filterResultData(options);
    if (Array.isArray(options) && primaryFilterProperty) return this.filterArrayData(options);
    return [];
  };

  render() {
    const { onSelect, placeholderText, renderLeftText, renderRightText } = this.props;

    const data = this.getData();

    return (
      <View style={localStyles.container}>
        <SearchBar
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          color="white"
          onChange={text => this.setState({ queryText: text })}
          placeholder={placeholderText}
          placeholderTextColor="white"
          style={[localStyles.text, localStyles.searchBar]}
        />
        {data.length > 0 && (
          <FlatList
            data={data}
            keyExtractor={item => item.id || item.name}
            renderItem={({ item }) => (
              <ResultRowWithOnePress
                item={item}
                onPress={onSelect}
                renderLeftText={renderLeftText}
                renderRightText={renderRightText}
              />
            )}
            keyboardShouldPersistTaps="always"
            style={localStyles.resultList}
          />
        )}
      </View>
    );
  }
}

export default AutocompleteSelector;

/* eslint-disable react/forbid-prop-types, react/require-default-props */
AutocompleteSelector.propTypes = {
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  queryString: PropTypes.string.isRequired,
  queryStringSecondary: PropTypes.string,
  sortKeyString: PropTypes.string.isRequired,
  placeholderText: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  renderLeftText: PropTypes.func,
  renderRightText: PropTypes.func,
  primaryFilterProperty: PropTypes.string,
  secondaryFilterProperty: PropTypes.string,
};
AutocompleteSelector.defaultProps = {
  placeholderText: generalStrings.start_typing_to_search,
};

// TODO: move ResultRow to dedicated file
// eslint-disable-next-line react/no-multi-comp
class ResultRow extends React.PureComponent {
  render() {
    // TODO: add ResultRow.propTypes
    // eslint-disable-next-line react/prop-types
    const { item, renderLeftText, renderRightText, onPress } = this.props;
    return (
      <TouchableOpacity style={localStyles.resultRow} onPress={() => onPress(item)}>
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
const ResultRowWithOnePress = withOnePress(ResultRow);

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultList: {
    flex: 1,
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
