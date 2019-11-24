/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from 'react-native-ui-components';
import { Dimensions, FlatList, StyleSheet, View, Text } from 'react-native';
import globalStyles, { APP_FONT_FAMILY, SUSSOL_ORANGE } from '../globalStyles';
import { generalStrings, buttonStrings } from '../localization';
import { OnePressButton } from '.';
import ResultRow from './ResultRow';

const MultiSelectList = ({
  options,
  sortByString,
  queryString,
  queryStringSecondary,
  primaryFilterProperty,
  secondaryFilterProperty,
  renderLeftText,
  renderRightText,
  showCheckIcon,
  placeholderText,
  onConfirmSelections,
  emptyMessage,
}) => {
  const [queryText, setQueryText] = useState('');
  const [selected, setSelected] = useState([]);

  const filterResultData = () => {
    const data = options.filtered(queryString, queryText);
    const secondaryFiltered = queryStringSecondary
      ? data.filtered(queryStringSecondary, queryText)
      : data;
    const sortedData = secondaryFiltered.sorted(sortByString);
    return sortedData;
  };

  const filterArrayData = () => {
    const regexFilter = RegExp(queryText, 'i');

    return options.filter(
      optionItem =>
        regexFilter.test(optionItem[primaryFilterProperty]) ||
        regexFilter.test(optionItem[secondaryFilterProperty])
    );
  };

  const getData = () => {
    if (options && options.filtered && queryString) return filterResultData(options);
    if (Array.isArray(options) && primaryFilterProperty) return filterArrayData(options);
    return [];
  };

  const onDoneSelected = useCallback(() => onConfirmSelections(selected), [selected]);

  const data = getData();

  const onSelect = useCallback(
    ({ item }) =>
      setSelected(prevState =>
        prevState.indexOf(item.id) === -1
          ? [...prevState, item.id]
          : prevState.filter(selectedItem => selectedItem !== item.id)
      ),
    []
  );

  const renderItem = useCallback(
    row => (
      <ResultRow
        data={row}
        onPress={onSelect}
        isSelected={selected.indexOf(row.item.id) >= 0}
        renderLeftText={renderLeftText}
        renderRightText={renderRightText}
        showCheckIcon={showCheckIcon}
      />
    ),
    [data, onSelect, renderLeftText, renderRightText, showCheckIcon]
  );

  const EmptyComponent = useCallback(
    ({ title }) => (
      <View style={localStyles.emptyContainer}>
        <Text style={localStyles.emptyText}>{title}</Text>
      </View>
    ),
    []
  );

  return (
    <View style={localStyles.container}>
      <SearchBar
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        color="white"
        onChange={setQueryText}
        placeholder={placeholderText}
        placeholderTextColor="white"
        style={[localStyles.text, localStyles.searchBar]}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.id || item.name}
        renderItem={renderItem}
        keyboardShouldPersistTaps="always"
        style={localStyles.resultList}
        extraData={selected}
        ListEmptyComponent={<EmptyComponent title={emptyMessage} />}
      />
      <View style={localStyles.contentContainer}>
        <View style={localStyles.buttonContainer}>
          <OnePressButton
            style={[globalStyles.button, localStyles.confirmButton]}
            textStyle={[globalStyles.buttonText, localStyles.confirmButtonText]}
            text={buttonStrings.done}
            onPress={onDoneSelected}
          />
        </View>
      </View>
    </View>
  );
};

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
  emptyMessage: PropTypes.string,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  emptyText: {
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
    padding: 15,
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
