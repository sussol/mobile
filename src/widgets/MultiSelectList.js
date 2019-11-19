/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from 'react-native-ui-components';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { complement } from 'set-manipulator';
import globalStyles, { APP_FONT_FAMILY, SUSSOL_ORANGE } from '../globalStyles';
import { generalStrings, buttonStrings } from '../localization';
import { OnePressButton } from '.';
import { ResultRow } from './ResultRow';

/**
 * A search bar that autocompletes from the options passed in, and allows any of
 * the dropdown options to be selected. Will gravefully handle null values
 * by using an empty array of searchable objects.
 * @prop  {array}     options         The options to select from
 * @prop  {function}  onSelect        A function taking the selected option as a parameter
 * @prop  {string}    queryString     The query to filter the options by, where $0 will
 *                                    be replaced by the user's current search
 *                                    e.g. 'name BEGINSWITH[c] $0 OR code BEGINSWITH[c] $0'
 * @prop  {string}    placeholderText The text to initially display in the search bar
 */
class MultiSelectList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      queryText: '',
      selected: [],
    };
  }

  /**
   * Filters a realm results object. Creates two realm results A, B
   * by two query strings. And concats A to B - A.
   */
  filterResultData = options => {
    const { sortByString, queryString, queryStringSecondary } = this.props;
    const { queryText } = this.state;

    let data = options
      .filtered(queryString, queryText)
      .sorted(sortByString)
      .slice();

    if (queryStringSecondary) {
      data = data.concat(
        complement(options.filtered(queryStringSecondary, queryText).sorted(sortByString), data)
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

  /**
   * Render single item of the FlatList
   *
   * @prop  {object}     data   Single item data.
   *
   * @returns {component} ResultRow
   *
   */
  renderItem = data => {
    const { renderLeftText, renderRightText, showCheckIcon } = this.props;
    return (
      <ResultRow
        data={data}
        onPress={() => this.onSelect(data)}
        isSelected={() => this.isSelected(data)}
        renderLeftText={renderLeftText}
        renderRightText={renderRightText}
        showCheckIcon={showCheckIcon}
      />
    );
  };

  /**
   * On select FlatList item update selected state
   *
   * @prop  {object}     data   Single item data.
   */
  onSelect = data =>
    this.setState(prevState =>
      prevState.selected.indexOf(data.item.id) === -1
        ? { selected: [...prevState.selected, data.item.id] }
        : { selected: prevState.selected.filter(i => i !== data.item.id) }
    );

  /**
   * Check if the single item is selected or not
   *
   * @prop  {object}     data   Single item data.
   *
   * @returns {bool}    selected state of the item
   */
  isSelected = data => {
    const { selected } = this.state;
    return !(selected.indexOf(data.item.id) === -1);
  };

  render() {
    const { placeholderText, onConfirmSelections } = this.props;
    const { selected } = this.state;
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
            renderItem={item => this.renderItem(item)}
            keyboardShouldPersistTaps="always"
            style={localStyles.resultList}
            extraData={selected}
          />
        )}
        <View style={localStyles.contentContainer}>
          <View style={[localStyles.buttonContainer]}>
            <OnePressButton
              style={[globalStyles.button, localStyles.confirmButton]}
              textStyle={[globalStyles.buttonText, localStyles.confirmButtonText]}
              text={buttonStrings.done}
              onPress={() => onConfirmSelections(selected)}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default MultiSelectList;
export { MultiSelectList };

/* eslint-disable react/forbid-prop-types, react/require-default-props */
MultiSelectList.propTypes = {
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  queryString: PropTypes.string.isRequired,
  queryStringSecondary: PropTypes.string,
  sortByString: PropTypes.string.isRequired,
  placeholderText: PropTypes.string,
  renderLeftText: PropTypes.func,
  renderRightText: PropTypes.func,
  primaryFilterProperty: PropTypes.string,
  secondaryFilterProperty: PropTypes.string,
  onConfirmSelections: PropTypes.func,
  showCheckIcon: PropTypes.bool,
};

MultiSelectList.defaultProps = {
  placeholderText: generalStrings.start_typing_to_search,
  showCheckIcon: true,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 15,
    right: 0,
  },
  contentContainer: {
    paddingTop: Dimensions.get('window').height / 10, // Start the content 1/10 down the page
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
  confirmButton: {
    backgroundColor: SUSSOL_ORANGE,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
  },
});
