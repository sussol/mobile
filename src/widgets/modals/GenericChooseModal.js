/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PageContentModal } from './PageContentModal';

import { COMPONENT_HEIGHT } from '../../globalStyles';

export default class GenericChooseModal extends React.PureComponent {
  keyExtractor = (item, index) => {
    const { field } = this.props;
    const content = field && item ? item[field] : item;
    return `${content}${index}`;
  };

  renderRow = ({ item, index }) => {
    const { onPress, field } = this.props;
    const { row, text } = localStyles;

    const rowStyle = index === 0 ? { ...row, backgroundColor: '#E95C30' } : row;
    const textStyle = index === 0 ? { ...text, color: '#FFF' } : text;
    return (
      <TouchableOpacity onPress={() => onPress({ item, index, field })}>
        <View style={rowStyle}>
          <Text style={textStyle}>{field ? item[field] : item}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { data, isOpen, title } = this.props;
    if (!data) return null;
    return (
      <PageContentModal isOpen={isOpen} style={{ alignItems: 'center' }} title={title}>
        <FlatList
          data={data}
          renderItem={this.renderRow}
          style={localStyles.list}
          keyExtractor={this.keyExtractor}
        />
      </PageContentModal>
    );
  }
}

const localStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingLeft: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: COMPONENT_HEIGHT,
  },
  list: {
    marginTop: 10,
    minWidth: '70%',
  },
  text: {
    fontSize: 20,
    marginLeft: 20,
  },
});

GenericChooseModal.defaultProps = {
  field: PropTypes.null,
};

GenericChooseModal.propTypes = {
  field: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
};
